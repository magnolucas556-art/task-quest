import {
  completeTask as completeDomainTask,
  createInitialState,
  createTask as createDomainTask,
  deleteTask as deleteDomainTask,
  editTask as editDomainTask,
  reopenTask as reopenDomainTask,
} from "./domain.js";
import { STORAGE_STATUS, loadState, saveState } from "./storage.js";

/** @typedef {ReturnType<typeof createInitialState>} AppState */
/** @typedef {ReturnType<typeof createDomainTask>} OperationResult */
/** @typedef {ReturnType<typeof saveState>} PersistenceResult */

/**
 * @typedef {object} SessionContext
 * @property {string | null} editingTaskId
 * @property {string} initializationStatus
 * @property {string} persistenceStatus
 * @property {boolean} firstUse
 * @property {boolean} recoveredFromInvalidData
 * @property {boolean} volatile
 */

/** @typedef {OperationResult & {persistence: PersistenceResult | null, context: SessionContext}} CoordinatedResult */

let currentState = createInitialState();
/** @type {unknown} */
let currentStorage;
let sessionContext = createSessionContext(STORAGE_STATUS.MISSING);

/**
 * Initializes the non-visual application session.
 *
 * @param {unknown} [storageOverride]
 * @returns {{state: AppState, context: ReturnType<typeof getSessionContext>}}
 */
export function initializeApp(storageOverride) {
  currentStorage = storageOverride;
  const loaded = loadState(currentStorage);
  currentState = loaded.state;
  sessionContext = createSessionContext(loaded.status);
  return getAppSnapshot();
}

/**
 * @returns {{state: AppState, context: ReturnType<typeof getSessionContext>}}
 */
export function getAppSnapshot() {
  return {
    state: currentState,
    context: getSessionContext(),
  };
}

/**
 * @param {unknown} text
 */
export function createTask(text) {
  const id = createUniqueTaskId();
  return applyOperation(createDomainTask(currentState, id, text));
}

/**
 * @param {unknown} id
 * @param {unknown} text
 */
export function editTask(id, text) {
  const operation = editDomainTask(currentState, id, text);
  if (operation.changed) {
    sessionContext.editingTaskId = null;
  }
  return applyOperation(operation);
}

/**
 * @param {unknown} id
 */
export function deleteTask(id) {
  const operation = deleteDomainTask(currentState, id);
  if (operation.changed && sessionContext.editingTaskId === id) {
    sessionContext.editingTaskId = null;
  }
  return applyOperation(operation);
}

/**
 * @param {unknown} id
 */
export function completeTask(id) {
  return applyOperation(completeDomainTask(currentState, id));
}

/**
 * @param {unknown} id
 */
export function reopenTask(id) {
  return applyOperation(reopenDomainTask(currentState, id));
}

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function beginEditing(id) {
  const exists = typeof id === "string" && currentState.tasks.some((task) => task.id === id);
  if (exists) {
    sessionContext.editingTaskId = id;
  }
  return exists;
}

export function cancelEditing() {
  sessionContext.editingTaskId = null;
}

/**
 * @param {OperationResult} operation
 * @returns {CoordinatedResult}
 */
function applyOperation(operation) {
  if (!operation.changed) {
    return withCurrentContext({ ...operation, persistence: null });
  }

  currentState = operation.state;
  const persistence = saveState(currentState, currentStorage);
  sessionContext.persistenceStatus = persistence.status;
  sessionContext.volatile = !persistence.persisted;

  return withCurrentContext({ ...operation, persistence });
}

/**
 * @param {OperationResult & {persistence: PersistenceResult | null}} result
 * @returns {CoordinatedResult}
 */
function withCurrentContext(result) {
  return {
    ...result,
    state: currentState,
    context: getSessionContext(),
  };
}

function createUniqueTaskId() {
  /** @type {string} */
  let id;
  do {
    id = globalThis.crypto.randomUUID();
  } while (currentState.tasks.some((task) => task.id === id));
  return id;
}

/**
 * @param {string} loadStatus
 * @returns {SessionContext}
 */
function createSessionContext(loadStatus) {
  return {
    editingTaskId: null,
    initializationStatus: loadStatus,
    persistenceStatus: loadStatus,
    firstUse: loadStatus === STORAGE_STATUS.MISSING,
    recoveredFromInvalidData: loadStatus === STORAGE_STATUS.INVALID,
    volatile:
      loadStatus === STORAGE_STATUS.UNAVAILABLE || loadStatus === STORAGE_STATUS.READ_FAILURE,
  };
}

/** @returns {SessionContext} */
function getSessionContext() {
  return { ...sessionContext };
}
