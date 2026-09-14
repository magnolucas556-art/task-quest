import {
  DOMAIN_ERRORS,
  completeTask as completeDomainTask,
  createInitialState,
  createTask as createDomainTask,
  deleteTask as deleteDomainTask,
  editTask as editDomainTask,
  getGamification,
  reopenTask as reopenDomainTask,
} from "./domain.js";
import { buildCalendarMonth, getInitialMonth, shiftMonth } from "./calendar.js";
import { STORAGE_STATUS, loadState, saveState } from "./storage.js";
import { createThemeController } from "./theme.js";
import { createUi } from "./ui.js";

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
export function createTask(text, details = {}) {
  const id = createUniqueTaskId();
  return applyOperation(createDomainTask(currentState, id, text, details));
}

/**
 * @param {unknown} id
 * @param {unknown} text
 */
export function editTask(id, text, details = {}) {
  const operation = editDomainTask(currentState, id, text, details);
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

function initializeBrowserApp() {
  const ui = createUi(globalThis.document);
  const theme = createThemeController(
    globalThis.document,
    globalThis.localStorage,
    globalThis.matchMedia?.("(prefers-color-scheme: dark)"),
  );
  /** @type {string | null} */
  let feedback = null;
  /** @type {string | null} */
  let createError = null;
  /** @type {string | null} */
  let editError = null;
  let activeView = "tasks";
  let calendarCursor = getInitialMonth();

  function render() {
    const snapshot = getAppSnapshot();
    const gamification = getGamification(snapshot.state.totalXp);
    if (!gamification.valid) {
      return;
    }
    ui.render({
      ...snapshot,
      gamification,
      editingTaskId: snapshot.context.editingTaskId,
      feedback,
      storageMessage: getStorageMessage(snapshot.context),
      createError,
      editError,
      activeView,
      calendar: buildCalendarMonth(snapshot.state.tasks, calendarCursor, localTodayIso()),
    });
  }

  ui.bindHandlers({
    toggleTheme() {
      const result = theme.toggle();
      feedback = result.persisted
        ? `Tema ${result.theme === "dark" ? "escuro" : "claro"} ativado.`
        : "Tema alterado somente para esta sessão.";
      render();
    },
    showView(view) {
      activeView = view;
      feedback = null;
      render();
    },
    changeMonth(delta) {
      calendarCursor = shiftMonth(calendarCursor, delta);
      render();
    },
    resetMonth() {
      calendarCursor = getInitialMonth();
      render();
    },
    create(text, details) {
      const result = createTask(text, details);
      createError = result.error === DOMAIN_ERRORS.INVALID_TASK_TEXT ? invalidTaskMessage() : null;
      feedback = result.changed ? "Tarefa criada." : null;
      render();
      if (result.changed) {
        ui.clearCreateInput();
      }
      ui.focusCreateInput();
    },
    beginEdit(taskId) {
      if (beginEditing(taskId)) {
        createError = null;
        editError = null;
        feedback = null;
        render();
        ui.focusEditInput(taskId);
      }
    },
    cancelEdit(taskId) {
      cancelEditing();
      editError = null;
      feedback = "Edição cancelada.";
      render();
      ui.focusPrimaryTaskAction(taskId);
    },
    saveEdit(taskId, text, details) {
      const result = editTask(taskId, text, details);
      editError = result.error === DOMAIN_ERRORS.INVALID_TASK_TEXT ? invalidTaskMessage() : null;
      feedback = result.changed ? "Tarefa editada." : null;
      render();
      if (result.changed) {
        ui.focusPrimaryTaskAction(taskId);
      } else {
        ui.focusEditInput(taskId);
      }
    },
    delete(taskId, focusTarget) {
      const result = deleteTask(taskId);
      editError = null;
      feedback = result.changed ? "Tarefa excluída." : null;
      render();
      if (result.changed) {
        ui.restoreDeletionFocus(focusTarget);
      }
    },
    complete(taskId) {
      const result = completeTask(taskId);
      feedback = result.changed ? completionMessage(result) : null;
      render();
      ui.focusPrimaryTaskAction(taskId);
    },
    reopen(taskId) {
      const result = reopenTask(taskId);
      feedback = result.changed ? "Tarefa reaberta. O XP conquistado foi mantido." : null;
      render();
      ui.focusPrimaryTaskAction(taskId);
    },
  });

  initializeApp();
  render();
}

function localTodayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function invalidTaskMessage() {
  return "A tarefa precisa possuir conteúdo válido antes de ser salva.";
}

/** @param {CoordinatedResult} result */
function completionMessage(result) {
  if (result.levelUp) {
    return `Tarefa concluída. Você subiu para o nível ${result.currentLevel}!`;
  }
  return result.xpDelta > 0
    ? "Tarefa concluída. Você ganhou 10 XP."
    : "Tarefa concluída. O XP conquistado foi mantido.";
}

/** @param {SessionContext} context */
function getStorageMessage(context) {
  if (context.volatile) {
    return "Não foi possível salvar os dados no navegador. Alterações recentes podem não permanecer após sair ou recarregar a página.";
  }
  if (context.recoveredFromInvalidData) {
    return "Os dados salvos estavam inválidos. A aplicação iniciou com um estado seguro.";
  }
  if (context.initializationStatus === STORAGE_STATUS.MIGRATED) {
    return "Seus dados da versão anterior foram atualizados com segurança.";
  }
  return null;
}

if (typeof globalThis.document !== "undefined") {
  if (globalThis.document.readyState === "loading") {
    globalThis.document.addEventListener("DOMContentLoaded", initializeBrowserApp, { once: true });
  } else {
    initializeBrowserApp();
  }
}
