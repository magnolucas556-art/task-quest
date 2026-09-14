/**
 * Creates the browser UI boundary. All DOM reads and writes remain in this module.
 *
 * @param {Document} documentRef
 */
export function createUi(documentRef) {
  const elements = getRequiredElements(documentRef);
  /** @type {UiHandlers | null} */
  let handlers = null;

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers?.create(elements.taskText.value);
  });

  elements.themeToggle.addEventListener("click", () => handlers?.toggleTheme());

  elements.taskList.addEventListener("click", (event) => {
    const button = getActionButton(event.target);
    if (!button || !handlers) {
      return;
    }

    const { action, taskId } = button.dataset;
    if (!action || !taskId) {
      return;
    }

    if (action === "edit") {
      handlers.beginEdit(taskId);
    } else if (action === "cancel-edit") {
      handlers.cancelEdit(taskId);
    } else if (action === "delete") {
      if (globalThis.confirm("Excluir esta tarefa definitivamente?")) {
        handlers.delete(taskId, getDeletionFocusTarget(elements.taskList, taskId));
      }
    } else if (action === "complete") {
      handlers.complete(taskId);
    } else if (action === "reopen") {
      handlers.reopen(taskId);
    }
  });

  elements.taskList.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof globalThis.HTMLFormElement) || !handlers) {
      return;
    }

    const taskId = form.dataset.taskId;
    const input = form.elements.namedItem("editText");
    if (taskId && input instanceof globalThis.HTMLInputElement) {
      handlers.saveEdit(taskId, input.value);
    }
  });

  return {
    /** @param {UiHandlers} nextHandlers */
    bindHandlers(nextHandlers) {
      handlers = nextHandlers;
    },

    /** @param {ViewModel} viewModel */
    render(viewModel) {
      renderProgress(elements, viewModel);
      renderMessages(elements, viewModel);
      renderTasks(documentRef, elements, viewModel);
    },

    clearCreateInput() {
      elements.taskText.value = "";
    },

    focusCreateInput() {
      elements.taskText.focus();
    },

    /** @param {string} taskId */
    focusEditInput(taskId) {
      getTaskElement(elements.taskList, taskId)?.querySelector("input")?.focus();
    },

    /** @param {string} taskId */
    focusPrimaryTaskAction(taskId) {
      getTaskElement(elements.taskList, taskId)?.querySelector("button")?.focus();
    },

    /** @param {FocusTarget} target */
    restoreDeletionFocus(target) {
      globalThis.requestAnimationFrame(() => {
        if (target.taskId) {
          const taskElement = getTaskElement(elements.taskList, target.taskId);
          const matchingAction = taskElement?.querySelector(`[data-action="${target.action}"]`);
          const fallbackAction = taskElement?.querySelector("button");
          const focusTarget = matchingAction ?? fallbackAction;
          if (focusTarget instanceof globalThis.HTMLElement) {
            focusTarget.focus();
          }
          return;
        }
        elements.taskText.focus();
      });
    },
  };
}

/**
 * @param {Document} documentRef
 */
function getRequiredElements(documentRef) {
  return {
    themeToggle: requiredElement(documentRef, "theme-toggle"),
    currentLevel: requiredElement(documentRef, "current-level"),
    currentLevelVisual: requiredElement(documentRef, "current-level-visual"),
    totalXp: requiredElement(documentRef, "total-xp"),
    levelProgress: requiredElement(documentRef, "level-progress"),
    levelProgressText: requiredElement(documentRef, "level-progress-text"),
    storageMessage: requiredElement(documentRef, "storage-message"),
    operationFeedback: requiredElement(documentRef, "operation-feedback"),
    taskForm: requiredElement(documentRef, "task-form"),
    taskText: /** @type {HTMLInputElement} */ (requiredElement(documentRef, "task-text")),
    taskError: requiredElement(documentRef, "task-error"),
    taskCount: requiredElement(documentRef, "task-count"),
    emptyState: requiredElement(documentRef, "empty-state"),
    taskList: requiredElement(documentRef, "task-list"),
  };
}

/**
 * @param {Document} documentRef
 * @param {string} id
 * @returns {HTMLElement}
 */
function requiredElement(documentRef, id) {
  const element = documentRef.getElementById(id);
  if (!element) {
    throw new Error(`Missing required UI element: ${id}`);
  }
  return element;
}

/** @param {ReturnType<typeof getRequiredElements>} elements @param {ViewModel} viewModel */
function renderProgress(elements, viewModel) {
  const { totalXp } = viewModel.state;
  const { level, progress } = viewModel.gamification;
  elements.currentLevel.textContent = String(level);
  elements.currentLevelVisual.textContent = String(level);
  elements.totalXp.textContent = `${totalXp} XP`;
  elements.levelProgress.setAttribute("value", String(progress));
  elements.levelProgress.textContent = `${progress} de 100 XP`;
  elements.levelProgressText.textContent = `${progress}/100 XP para o próximo nível`;
}

/** @param {ReturnType<typeof getRequiredElements>} elements @param {ViewModel} viewModel */
function renderMessages(elements, viewModel) {
  setMessage(elements.operationFeedback, viewModel.feedback);
  setMessage(elements.storageMessage, viewModel.storageMessage);
  setMessage(elements.taskError, viewModel.createError);
  elements.taskText.setAttribute("aria-invalid", viewModel.createError ? "true" : "false");
}

/**
 * @param {Document} documentRef
 * @param {ReturnType<typeof getRequiredElements>} elements
 * @param {ViewModel} viewModel
 */
function renderTasks(documentRef, elements, viewModel) {
  const { tasks } = viewModel.state;
  const taskLabel = tasks.length === 1 ? "1 tarefa" : `${tasks.length} tarefas`;
  elements.taskCount.textContent = taskLabel;
  elements.emptyState.hidden = tasks.length > 0;
  elements.taskList.hidden = tasks.length === 0;
  elements.taskList.replaceChildren(
    ...tasks.map((task) =>
      task.id === viewModel.editingTaskId
        ? createEditingTask(documentRef, task, viewModel.editError)
        : createTaskItem(documentRef, task),
    ),
  );
}

/** @param {Document} documentRef @param {Task} task */
function createTaskItem(documentRef, task) {
  const item = createTaskContainer(documentRef, task);
  const text = documentRef.createElement("p");
  text.className = "task-text";
  text.textContent = task.text;

  const status = documentRef.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Concluída" : "Pendente";

  const actions = documentRef.createElement("div");
  actions.className = "task-actions";
  const stateAction = task.completed ? "reopen" : "complete";
  const stateLabel = task.completed ? "Reabrir" : "Concluir";
  actions.append(
    createActionButton(documentRef, task, stateAction, stateLabel),
    createActionButton(documentRef, task, "edit", "Editar"),
    createActionButton(documentRef, task, "delete", "Excluir"),
  );

  item.append(text, status, actions);
  return item;
}

/** @param {Document} documentRef @param {Task} task @param {string | null} editError */
function createEditingTask(documentRef, task, editError) {
  const item = createTaskContainer(documentRef, task);
  item.classList.add("task-item--editing");

  const form = documentRef.createElement("form");
  form.className = "edit-form";
  form.dataset.taskId = task.id;

  const label = documentRef.createElement("label");
  const inputId = `edit-${task.id}`;
  const errorId = `edit-error-${task.id}`;
  label.htmlFor = inputId;
  label.textContent = "Editar descrição da tarefa";

  const input = documentRef.createElement("input");
  input.id = inputId;
  input.name = "editText";
  input.type = "text";
  input.value = task.text;
  input.required = true;
  input.setAttribute("aria-describedby", errorId);
  input.setAttribute("aria-invalid", editError ? "true" : "false");

  const error = documentRef.createElement("p");
  error.id = errorId;
  error.className = "field-error";
  setMessage(error, editError);

  const actions = documentRef.createElement("div");
  actions.className = "edit-actions";
  const save = documentRef.createElement("button");
  save.type = "submit";
  save.textContent = "Salvar";
  save.setAttribute("aria-label", `Salvar edição: ${task.text}`);
  actions.append(save, createActionButton(documentRef, task, "cancel-edit", "Cancelar"));

  form.append(label, input, error, actions);
  item.append(form);
  return item;
}

/** @param {Document} documentRef @param {Task} task */
function createTaskContainer(documentRef, task) {
  const item = documentRef.createElement("li");
  item.className = "task-item";
  item.dataset.taskId = task.id;
  item.dataset.state = task.completed ? "completed" : "pending";
  return item;
}

/**
 * @param {Document} documentRef
 * @param {Task} task
 * @param {string} action
 * @param {string} label
 */
function createActionButton(documentRef, task, action, label) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.dataset.taskId = task.id;
  button.textContent = label;
  button.setAttribute("aria-label", `${label}: ${task.text}`);
  return button;
}

/** @param {unknown} target @returns {HTMLButtonElement | null} */
function getActionButton(target) {
  if (!(target instanceof globalThis.Element)) {
    return null;
  }
  const button = target.closest("button[data-action][data-task-id]");
  return button instanceof globalThis.HTMLButtonElement ? button : null;
}

/** @param {Element} list @param {string} taskId */
function getDeletionFocusTarget(list, taskId) {
  const tasks = Array.from(list.children);
  const index = tasks.findIndex((task) => task.getAttribute("data-task-id") === taskId);
  const nextTask = tasks[index + 1] ?? tasks[index - 1];
  return {
    taskId: nextTask?.getAttribute("data-task-id") ?? null,
    action: "delete",
  };
}

/** @param {Element} list @param {string} taskId */
function getTaskElement(list, taskId) {
  return Array.from(list.children).find((item) => item.getAttribute("data-task-id") === taskId);
}

/** @param {HTMLElement} element @param {string | null} message */
function setMessage(element, message) {
  element.textContent = message ?? "";
  element.hidden = !message;
}

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 */

/**
 * @typedef {object} FocusTarget
 * @property {string | null} taskId
 * @property {string} action
 */

/**
 * @typedef {object} UiHandlers
 * @property {() => void} toggleTheme
 * @property {(text: string) => void} create
 * @property {(taskId: string) => void} beginEdit
 * @property {(taskId: string) => void} cancelEdit
 * @property {(taskId: string, text: string) => void} saveEdit
 * @property {(taskId: string, focusTarget: FocusTarget) => void} delete
 * @property {(taskId: string) => void} complete
 * @property {(taskId: string) => void} reopen
 */

/**
 * @typedef {object} ViewModel
 * @property {{totalXp: number, tasks: Task[]}} state
 * @property {{level: number, progress: number}} gamification
 * @property {string | null} editingTaskId
 * @property {string | null} feedback
 * @property {string | null} storageMessage
 * @property {string | null} createError
 * @property {string | null} editError
 */
