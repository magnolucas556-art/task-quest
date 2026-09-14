export const SCHEMA_VERSION = 2;
export const LEGACY_SCHEMA_VERSION = 1;
export const XP_PER_TASK = 10;
export const XP_PER_LEVEL = 100;
export const PRIORITIES = Object.freeze({ LOW: "low", MEDIUM: "medium", HIGH: "high" });

export const DOMAIN_ERRORS = Object.freeze({
  DUPLICATE_TASK_ID: "DUPLICATE_TASK_ID", INVALID_STATE: "INVALID_STATE",
  INVALID_TASK_ID: "INVALID_TASK_ID", INVALID_TASK_TEXT: "INVALID_TASK_TEXT",
  INVALID_PRIORITY: "INVALID_PRIORITY", INVALID_DUE_DATE: "INVALID_DUE_DATE",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
});

/** @typedef {"low" | "medium" | "high"} Priority */
/** @typedef {{id:string,text:string,completed:boolean,xpAwarded:boolean,priority:Priority,dueDate:string|null}} Task */
/** @typedef {{schemaVersion:number,totalXp:number,tasks:Task[]}} AppState */
/** @typedef {{valid:boolean,error:string|null}} ValidationResult */
/** @typedef {{state:AppState,changed:boolean,error:string|null,xpDelta:number,previousLevel:number|null,currentLevel:number|null,levelUp:boolean}} OperationResult */
/** @typedef {{priority?:unknown,dueDate?:unknown}} TaskDetails */

/** @returns {AppState} */
export function createInitialState() {
  return { schemaVersion: SCHEMA_VERSION, totalXp: 0, tasks: [] };
}

/** @param {unknown} candidate @returns {ValidationResult} */
export function validateState(candidate) {
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["schemaVersion", "totalXp", "tasks"])) {
    return invalidState();
  }
  if (candidate.schemaVersion !== SCHEMA_VERSION || !isValidTotalXp(candidate.totalXp) || !Array.isArray(candidate.tasks)) {
    return invalidState();
  }
  return validateTasksAndXp(candidate.tasks, candidate.totalXp, isValidTask);
}

/**
 * Accepts only complete V2 data or a complete valid V1 document that can be migrated safely.
 * @param {unknown} candidate
 * @returns {{valid:true,state:AppState,migrated:boolean}|{valid:false,state:null,migrated:false}}
 */
export function migrateState(candidate) {
  if (validateState(candidate).valid) {
    return { valid: true, state: /** @type {AppState} */ (candidate), migrated: false };
  }
  if (!isValidLegacyState(candidate)) {
    return { valid: false, state: null, migrated: false };
  }
  const legacy = /** @type {{schemaVersion:number,totalXp:number,tasks:Array<{id:string,text:string,completed:boolean,xpAwarded:boolean}>}} */ (candidate);
  return {
    valid: true,
    migrated: true,
    state: {
      schemaVersion: SCHEMA_VERSION,
      totalXp: legacy.totalXp,
      tasks: legacy.tasks.map((task) => ({ ...task, priority: PRIORITIES.MEDIUM, dueDate: null })),
    },
  };
}

/** @param {unknown} totalXp @returns {{valid:true,error:null,level:number,progress:number}|{valid:false,error:string,level:null,progress:null}} */
export function getGamification(totalXp) {
  if (!isValidTotalXp(totalXp)) {
    return { valid: false, error: DOMAIN_ERRORS.INVALID_STATE, level: null, progress: null };
  }
  return { valid: true, error: null, level: levelFor(totalXp), progress: totalXp % XP_PER_LEVEL };
}

/** @param {AppState} state @param {unknown} id @param {unknown} text @param {TaskDetails} [details] @returns {OperationResult} */
export function createTask(state, id, text, details = {}) {
  const stateError = validateOperationState(state);
  if (stateError) { return unchangedResult(state, stateError); }
  if (!isValidId(id)) { return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID); }
  if (state.tasks.some((task) => task.id === id)) { return unchangedResult(state, DOMAIN_ERRORS.DUPLICATE_TASK_ID); }
  const normalizedText = normalizeText(text);
  if (normalizedText === null) { return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_TEXT); }
  const metadata = normalizeDetails(details, PRIORITIES.MEDIUM, null);
  if (metadata.error) { return unchangedResult(state, metadata.error); }
  const task = { id, text: normalizedText, completed: false, xpAwarded: false, priority: metadata.priority, dueDate: metadata.dueDate };
  return changedResult(state, { ...state, tasks: [...state.tasks, task] });
}

/** @param {AppState} state @param {unknown} id @param {unknown} text @param {TaskDetails} [details] @returns {OperationResult} */
export function editTask(state, id, text, details = {}) {
  const stateError = validateOperationState(state);
  if (stateError) { return unchangedResult(state, stateError); }
  if (!isValidId(id)) { return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID); }
  const taskIndex = state.tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) { return unchangedResult(state, DOMAIN_ERRORS.TASK_NOT_FOUND); }
  const normalizedText = normalizeText(text);
  if (normalizedText === null) { return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_TEXT); }
  const current = state.tasks[taskIndex];
  const metadata = normalizeDetails(details, current.priority, current.dueDate);
  if (metadata.error) { return unchangedResult(state, metadata.error); }
  if (current.text === normalizedText && current.priority === metadata.priority && current.dueDate === metadata.dueDate) {
    return unchangedResult(state);
  }
  const tasks = replaceTask(state.tasks, taskIndex, { ...current, text: normalizedText, priority: metadata.priority, dueDate: metadata.dueDate });
  return changedResult(state, { ...state, tasks });
}

/** @param {AppState} state @param {unknown} id @returns {OperationResult} */
export function deleteTask(state, id) {
  const found = findTaskForOperation(state, id);
  if (found.error) { return unchangedResult(state, found.error); }
  const tasks = state.tasks.filter((_task, index) => index !== found.index);
  return changedResult(state, { ...state, tasks });
}

/** @param {AppState} state @param {unknown} id @returns {OperationResult} */
export function completeTask(state, id) {
  const found = findTaskForOperation(state, id);
  if (found.error) { return unchangedResult(state, found.error); }
  const task = state.tasks[found.index];
  if (task.completed) { return unchangedResult(state); }
  const xpDelta = task.xpAwarded ? 0 : XP_PER_TASK;
  const tasks = replaceTask(state.tasks, found.index, { ...task, completed: true, xpAwarded: true });
  return changedResult(state, { ...state, totalXp: state.totalXp + xpDelta, tasks }, xpDelta);
}

/** @param {AppState} state @param {unknown} id @returns {OperationResult} */
export function reopenTask(state, id) {
  const found = findTaskForOperation(state, id);
  if (found.error) { return unchangedResult(state, found.error); }
  const task = state.tasks[found.index];
  if (!task.completed) { return unchangedResult(state); }
  const tasks = replaceTask(state.tasks, found.index, { ...task, completed: false });
  return changedResult(state, { ...state, tasks });
}

/** @param {unknown} value @returns {value is Priority} */
export function isValidPriority(value) {
  return value === PRIORITIES.LOW || value === PRIORITIES.MEDIUM || value === PRIORITIES.HIGH;
}

/** @param {unknown} value @returns {value is string|null} */
export function isValidDueDate(value) {
  if (value === null) { return true; }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) { return false; }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** @param {Task} task @param {string} todayIso */
export function isTaskOverdue(task, todayIso) {
  return !task.completed && task.dueDate !== null && isValidDueDate(todayIso) && task.dueDate < todayIso;
}

/** @param {unknown} details @param {Priority} fallbackPriority @param {string|null} fallbackDueDate */
function normalizeDetails(details, fallbackPriority, fallbackDueDate) {
  if (!isRecord(details)) { return { priority: fallbackPriority, dueDate: fallbackDueDate, error: DOMAIN_ERRORS.INVALID_STATE }; }
  const priority = details.priority === undefined ? fallbackPriority : details.priority;
  const dueDate = details.dueDate === undefined ? fallbackDueDate : details.dueDate === "" ? null : details.dueDate;
  if (!isValidPriority(priority)) { return { priority: fallbackPriority, dueDate: fallbackDueDate, error: DOMAIN_ERRORS.INVALID_PRIORITY }; }
  if (!isValidDueDate(dueDate)) { return { priority, dueDate: fallbackDueDate, error: DOMAIN_ERRORS.INVALID_DUE_DATE }; }
  return { priority, dueDate, error: null };
}

/** @param {AppState} state @param {unknown} id */
function findTaskForOperation(state, id) {
  const stateError = validateOperationState(state);
  if (stateError) { return { index: -1, error: stateError }; }
  if (!isValidId(id)) { return { index: -1, error: DOMAIN_ERRORS.INVALID_TASK_ID }; }
  const index = state.tasks.findIndex((task) => task.id === id);
  return index < 0 ? { index, error: DOMAIN_ERRORS.TASK_NOT_FOUND } : { index, error: null };
}

/** @param {unknown[]} tasks @param {number} totalXp @param {(task:unknown)=>boolean} validator */
function validateTasksAndXp(tasks, totalXp, validator) {
  const ids = new Set();
  let representedXp = 0;
  for (const task of tasks) {
    if (!validator(task) || !isRecord(task) || ids.has(task.id)) { return invalidState(); }
    ids.add(task.id);
    representedXp += task.xpAwarded ? XP_PER_TASK : 0;
  }
  return totalXp < representedXp ? invalidState() : { valid: true, error: null };
}

/** @param {unknown} candidate @returns {candidate is Task} */
function isValidTask(candidate) {
  return isRecord(candidate) && hasOnlyKeys(candidate, ["id", "text", "completed", "xpAwarded", "priority", "dueDate"])
    && isValidCoreTask(candidate) && isValidPriority(candidate.priority) && isValidDueDate(candidate.dueDate);
}

/** @param {unknown} candidate */
function isValidLegacyState(candidate) {
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["schemaVersion", "totalXp", "tasks"]) || candidate.schemaVersion !== LEGACY_SCHEMA_VERSION || !isValidTotalXp(candidate.totalXp) || !Array.isArray(candidate.tasks)) { return false; }
  return validateTasksAndXp(candidate.tasks, candidate.totalXp, (task) => isRecord(task) && hasOnlyKeys(task, ["id", "text", "completed", "xpAwarded"]) && isValidCoreTask(task)).valid;
}

/** @param {Record<string, unknown>} candidate */
function isValidCoreTask(candidate) {
  return isValidId(candidate.id) && normalizeText(candidate.text) !== null && typeof candidate.completed === "boolean" && typeof candidate.xpAwarded === "boolean" && (!candidate.completed || candidate.xpAwarded);
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) { return typeof value === "object" && value !== null && !Array.isArray(value); }
/** @param {Record<string, unknown>} value @param {string[]} keys */
function hasOnlyKeys(value, keys) { const actual = Object.keys(value); return actual.length === keys.length && actual.every((key) => keys.includes(key)); }
/** @param {unknown} totalXp @returns {totalXp is number} */
function isValidTotalXp(totalXp) { return typeof totalXp === "number" && Number.isSafeInteger(totalXp) && totalXp >= 0 && totalXp % XP_PER_TASK === 0; }
/** @param {unknown} id @returns {id is string} */
function isValidId(id) { return typeof id === "string" && id.trim().length > 0; }
/** @param {unknown} text */
function normalizeText(text) { if (typeof text !== "string") { return null; } const normalized = text.trim(); return normalized.length > 0 ? normalized : null; }
function invalidState() { return { valid: false, error: DOMAIN_ERRORS.INVALID_STATE }; }
/** @param {AppState} state */
function validateOperationState(state) { const validation = validateState(state); return validation.valid ? null : validation.error; }
/** @param {number} totalXp */
function levelFor(totalXp) { return Math.floor(totalXp / XP_PER_LEVEL) + 1; }
/** @param {AppState} state @param {string|null} [error] @returns {OperationResult} */
function unchangedResult(state, error = null) { const valid = validateState(state).valid; const level = valid ? levelFor(state.totalXp) : null; return { state, changed: false, error, xpDelta: 0, previousLevel: level, currentLevel: level, levelUp: false }; }
/** @param {AppState} previousState @param {AppState} state @param {number} [xpDelta] @returns {OperationResult} */
function changedResult(previousState, state, xpDelta = 0) { const previousLevel = levelFor(previousState.totalXp); const currentLevel = levelFor(state.totalXp); return { state, changed: true, error: null, xpDelta, previousLevel, currentLevel, levelUp: currentLevel > previousLevel }; }
/** @param {Task[]} tasks @param {number} index @param {Task} task */
function replaceTask(tasks, index, task) { return tasks.map((current, currentIndex) => currentIndex === index ? task : current); }
