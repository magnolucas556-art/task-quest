export const SCHEMA_VERSION = 1;
export const XP_PER_TASK = 10;
export const XP_PER_LEVEL = 100;

export const DOMAIN_ERRORS = Object.freeze({
  DUPLICATE_TASK_ID: "DUPLICATE_TASK_ID",
  INVALID_STATE: "INVALID_STATE",
  INVALID_TASK_ID: "INVALID_TASK_ID",
  INVALID_TASK_TEXT: "INVALID_TASK_TEXT",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
});

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {boolean} xpAwarded
 */

/**
 * @typedef {object} AppState
 * @property {number} schemaVersion
 * @property {number} totalXp
 * @property {Task[]} tasks
 */

/**
 * @typedef {object} ValidationResult
 * @property {boolean} valid
 * @property {string | null} error
 */

/**
 * @typedef {object} OperationResult
 * @property {AppState} state
 * @property {boolean} changed
 * @property {string | null} error
 * @property {number} xpDelta
 * @property {number | null} previousLevel
 * @property {number | null} currentLevel
 * @property {boolean} levelUp
 */

/**
 * Creates an independent safe state for a new session.
 *
 * @returns {AppState}
 */
export function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    totalXp: 0,
    tasks: [],
  };
}

/**
 * Validates the complete state and its cross-field invariants.
 *
 * @param {unknown} candidate
 * @returns {ValidationResult}
 */
export function validateState(candidate) {
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["schemaVersion", "totalXp", "tasks"])) {
    return invalidState();
  }

  if (candidate.schemaVersion !== SCHEMA_VERSION || !isValidTotalXp(candidate.totalXp)) {
    return invalidState();
  }

  if (!Array.isArray(candidate.tasks)) {
    return invalidState();
  }

  const ids = new Set();
  let representedXp = 0;

  for (const task of candidate.tasks) {
    if (!isValidTask(task) || ids.has(task.id)) {
      return invalidState();
    }

    ids.add(task.id);
    representedXp += task.xpAwarded ? XP_PER_TASK : 0;
  }

  if (candidate.totalXp < representedXp) {
    return invalidState();
  }

  return { valid: true, error: null };
}

/**
 * Returns level data derived exclusively from total XP.
 *
 * @param {unknown} totalXp
 * @returns {{valid: true, error: null, level: number, progress: number} | {valid: false, error: string, level: null, progress: null}}
 */
export function getGamification(totalXp) {
  if (!isValidTotalXp(totalXp)) {
    return {
      valid: false,
      error: DOMAIN_ERRORS.INVALID_STATE,
      level: null,
      progress: null,
    };
  }

  return {
    valid: true,
    error: null,
    level: levelFor(totalXp),
    progress: totalXp % XP_PER_LEVEL,
  };
}

/**
 * Adds a pending, unrewarded task using an ID supplied by the coordinator.
 *
 * @param {AppState} state
 * @param {unknown} id
 * @param {unknown} text
 * @returns {OperationResult}
 */
export function createTask(state, id, text) {
  const stateError = validateOperationState(state);
  if (stateError) {
    return unchangedResult(state, stateError);
  }

  if (!isValidId(id)) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID);
  }

  if (state.tasks.some((task) => task.id === id)) {
    return unchangedResult(state, DOMAIN_ERRORS.DUPLICATE_TASK_ID);
  }

  const normalizedText = normalizeText(text);
  if (normalizedText === null) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_TEXT);
  }

  const task = {
    id,
    text: normalizedText,
    completed: false,
    xpAwarded: false,
  };

  return changedResult(state, { ...state, tasks: [...state.tasks, task] });
}

/**
 * Changes only the text of an existing task.
 *
 * @param {AppState} state
 * @param {unknown} id
 * @param {unknown} text
 * @returns {OperationResult}
 */
export function editTask(state, id, text) {
  const stateError = validateOperationState(state);
  if (stateError) {
    return unchangedResult(state, stateError);
  }

  if (!isValidId(id)) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID);
  }

  const taskIndex = state.tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) {
    return unchangedResult(state, DOMAIN_ERRORS.TASK_NOT_FOUND);
  }

  const normalizedText = normalizeText(text);
  if (normalizedText === null) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_TEXT);
  }

  if (state.tasks[taskIndex].text === normalizedText) {
    return unchangedResult(state);
  }

  const tasks = replaceTask(state.tasks, taskIndex, {
    ...state.tasks[taskIndex],
    text: normalizedText,
  });

  return changedResult(state, { ...state, tasks });
}

/**
 * Removes a task without changing accumulated XP.
 *
 * @param {AppState} state
 * @param {unknown} id
 * @returns {OperationResult}
 */
export function deleteTask(state, id) {
  const stateError = validateOperationState(state);
  if (stateError) {
    return unchangedResult(state, stateError);
  }

  if (!isValidId(id)) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID);
  }

  const taskIndex = state.tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) {
    return unchangedResult(state, DOMAIN_ERRORS.TASK_NOT_FOUND);
  }

  const tasks = state.tasks.filter((_task, index) => index !== taskIndex);
  return changedResult(state, { ...state, tasks });
}

/**
 * Completes a task and grants XP only on its first eligible completion.
 *
 * @param {AppState} state
 * @param {unknown} id
 * @returns {OperationResult}
 */
export function completeTask(state, id) {
  const stateError = validateOperationState(state);
  if (stateError) {
    return unchangedResult(state, stateError);
  }

  if (!isValidId(id)) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID);
  }

  const taskIndex = state.tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) {
    return unchangedResult(state, DOMAIN_ERRORS.TASK_NOT_FOUND);
  }

  const task = state.tasks[taskIndex];
  if (task.completed) {
    return unchangedResult(state);
  }

  const xpDelta = task.xpAwarded ? 0 : XP_PER_TASK;
  const tasks = replaceTask(state.tasks, taskIndex, {
    ...task,
    completed: true,
    xpAwarded: true,
  });
  const nextState = {
    ...state,
    totalXp: state.totalXp + xpDelta,
    tasks,
  };

  return changedResult(state, nextState, xpDelta);
}

/**
 * Reopens a task while preserving its reward and accumulated XP.
 *
 * @param {AppState} state
 * @param {unknown} id
 * @returns {OperationResult}
 */
export function reopenTask(state, id) {
  const stateError = validateOperationState(state);
  if (stateError) {
    return unchangedResult(state, stateError);
  }

  if (!isValidId(id)) {
    return unchangedResult(state, DOMAIN_ERRORS.INVALID_TASK_ID);
  }

  const taskIndex = state.tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) {
    return unchangedResult(state, DOMAIN_ERRORS.TASK_NOT_FOUND);
  }

  const task = state.tasks[taskIndex];
  if (!task.completed) {
    return unchangedResult(state);
  }

  const tasks = replaceTask(state.tasks, taskIndex, {
    ...task,
    completed: false,
  });

  return changedResult(state, { ...state, tasks });
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {Record<string, unknown>} value
 * @param {string[]} keys
 * @returns {boolean}
 */
function hasOnlyKeys(value, keys) {
  const actualKeys = Object.keys(value);
  return actualKeys.length === keys.length && actualKeys.every((key) => keys.includes(key));
}

/**
 * @param {unknown} totalXp
 * @returns {totalXp is number}
 */
function isValidTotalXp(totalXp) {
  return (
    typeof totalXp === "number" &&
    Number.isInteger(totalXp) &&
    totalXp >= 0 &&
    totalXp % XP_PER_TASK === 0
  );
}

/**
 * @param {unknown} id
 * @returns {id is string}
 */
function isValidId(id) {
  return typeof id === "string" && id.trim().length > 0;
}

/**
 * @param {unknown} text
 * @returns {string | null}
 */
function normalizeText(text) {
  if (typeof text !== "string") {
    return null;
  }

  const normalized = text.trim();
  return normalized.length > 0 ? normalized : null;
}

/**
 * @param {unknown} candidate
 * @returns {candidate is Task}
 */
function isValidTask(candidate) {
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["id", "text", "completed", "xpAwarded"])) {
    return false;
  }

  if (!isValidId(candidate.id) || normalizeText(candidate.text) === null) {
    return false;
  }

  if (typeof candidate.completed !== "boolean" || typeof candidate.xpAwarded !== "boolean") {
    return false;
  }

  return !candidate.completed || candidate.xpAwarded;
}

/**
 * @returns {ValidationResult}
 */
function invalidState() {
  return { valid: false, error: DOMAIN_ERRORS.INVALID_STATE };
}

/**
 * @param {AppState} state
 * @returns {string | null}
 */
function validateOperationState(state) {
  const validation = validateState(state);
  return validation.valid ? null : validation.error;
}

/**
 * @param {number} totalXp
 * @returns {number}
 */
function levelFor(totalXp) {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/**
 * @param {AppState} state
 * @param {string | null} [error]
 * @returns {OperationResult}
 */
function unchangedResult(state, error = null) {
  const validation = validateState(state);
  const level = validation.valid ? levelFor(state.totalXp) : null;

  return {
    state,
    changed: false,
    error,
    xpDelta: 0,
    previousLevel: level,
    currentLevel: level,
    levelUp: false,
  };
}

/**
 * @param {AppState} previousState
 * @param {AppState} state
 * @param {number} [xpDelta]
 * @returns {OperationResult}
 */
function changedResult(previousState, state, xpDelta = 0) {
  const previousLevel = levelFor(previousState.totalXp);
  const currentLevel = levelFor(state.totalXp);

  return {
    state,
    changed: true,
    error: null,
    xpDelta,
    previousLevel,
    currentLevel,
    levelUp: currentLevel > previousLevel,
  };
}

/**
 * @param {Task[]} tasks
 * @param {number} index
 * @param {Task} task
 * @returns {Task[]}
 */
function replaceTask(tasks, index, task) {
  return tasks.map((currentTask, currentIndex) => (currentIndex === index ? task : currentTask));
}
