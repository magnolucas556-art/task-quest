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
    handlers?.create(elements.taskText.value, {
      priority: elements.taskPriority.value,
      dueDate: elements.taskDueDate.value,
    });
  });

  elements.themeToggle.addEventListener("click", () => handlers?.toggleTheme());
  elements.viewNav.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof globalThis.HTMLButtonElement && target.dataset.view && handlers) {
      handlers.showView(target.dataset.view);
    }
  });
  elements.calendarPrevious.addEventListener("click", () => handlers?.changeMonth(-1));
  elements.calendarNext.addEventListener("click", () => handlers?.changeMonth(1));
  elements.calendarToday.addEventListener("click", () => handlers?.resetMonth());

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
    const priority = form.elements.namedItem("editPriority");
    const dueDate = form.elements.namedItem("editDueDate");
    if (taskId && input instanceof globalThis.HTMLInputElement && priority && dueDate instanceof globalThis.HTMLInputElement) {
      handlers.saveEdit(taskId, input.value, {
        priority: /** @type {HTMLSelectElement} */ (priority).value,
        dueDate: dueDate.value,
      });
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
      renderCalendar(documentRef, elements, viewModel);
      renderInsights(documentRef, elements, viewModel);
      renderActiveView(elements, viewModel.activeView);
    },

    clearCreateInput() {
      elements.taskText.value = "";
      elements.taskPriority.value = "medium";
      elements.taskDueDate.value = "";
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
    viewNav: requiredElement(documentRef, "view-nav"),
    currentLevel: requiredElement(documentRef, "current-level"),
    currentLevelVisual: requiredElement(documentRef, "current-level-visual"),
    totalXp: requiredElement(documentRef, "total-xp"),
    levelProgress: requiredElement(documentRef, "level-progress"),
    levelProgressText: requiredElement(documentRef, "level-progress-text"),
    storageMessage: requiredElement(documentRef, "storage-message"),
    operationFeedback: requiredElement(documentRef, "operation-feedback"),
    taskForm: requiredElement(documentRef, "task-form"),
    taskText: /** @type {HTMLInputElement} */ (requiredElement(documentRef, "task-text")),
    taskPriority: /** @type {HTMLSelectElement} */ (requiredElement(documentRef, "task-priority")),
    taskDueDate: /** @type {HTMLInputElement} */ (requiredElement(documentRef, "task-due-date")),
    taskError: requiredElement(documentRef, "task-error"),
    taskCount: requiredElement(documentRef, "task-count"),
    emptyState: requiredElement(documentRef, "empty-state"),
    taskList: requiredElement(documentRef, "task-list"),
    taskCreator: /** @type {HTMLElement} */ (requiredElement(documentRef, "task-form").closest("section")),
    taskListSection: /** @type {HTMLElement} */ (requiredElement(documentRef, "task-list").closest("section")),
    calendarPanel: requiredElement(documentRef, "calendar-panel"),
    calendarPrevious: requiredElement(documentRef, "calendar-previous"),
    calendarNext: requiredElement(documentRef, "calendar-next"),
    calendarToday: requiredElement(documentRef, "calendar-today"),
    calendarLabel: requiredElement(documentRef, "calendar-label"),
    calendarGrid: requiredElement(documentRef, "calendar-grid"),
    calendarEmpty: requiredElement(documentRef, "calendar-empty"),
    insightsPanel: requiredElement(documentRef, "insights-panel"),
    metricTotal: requiredElement(documentRef, "metric-total"),
    metricCompleted: requiredElement(documentRef, "metric-completed"),
    metricRate: requiredElement(documentRef, "metric-rate"),
    metricPending: requiredElement(documentRef, "metric-pending"),
    metricToday: requiredElement(documentRef, "metric-today"),
    metricOverdue: requiredElement(documentRef, "metric-overdue"),
    charts: requiredElement(documentRef, "charts"),
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

/** @param {Document} documentRef @param {ReturnType<typeof getRequiredElements>} elements @param {ViewModel} viewModel */
function renderCalendar(documentRef, elements, viewModel) {
  elements.calendarLabel.textContent = viewModel.calendar.label;
  const tasksInMonth = viewModel.calendar.days.reduce((total, day) => total + (day.inCurrentMonth ? day.tasks.length : 0), 0);
  elements.calendarEmpty.hidden = tasksInMonth > 0;
  elements.calendarGrid.replaceChildren(...viewModel.calendar.days.map((day) => {
    const cell = documentRef.createElement("li");
    cell.className = "calendar-day";
    cell.dataset.outside = String(!day.inCurrentMonth);
    if (day.isToday) { cell.dataset.today = "true"; }
    const date = documentRef.createElement("time");
    date.dateTime = day.dateIso;
    date.textContent = String(day.day);
    if (day.isToday) { date.setAttribute("aria-label", `${day.day}, hoje`); }
    const list = documentRef.createElement("ul");
    for (const task of day.tasks) {
      const item = documentRef.createElement("li");
      item.className = `calendar-task calendar-task--${task.priority}`;
      item.dataset.completed = String(task.completed);
      item.textContent = task.text;
      item.title = task.text;
      list.append(item);
    }
    cell.append(date, list);
    return cell;
  }));
}

/** @param {ReturnType<typeof getRequiredElements>} elements @param {string} activeView */
function renderActiveView(elements, activeView) {
  const calendarActive = activeView === "calendar";
  const insightsActive = activeView === "insights";
  elements.taskCreator.hidden = calendarActive || insightsActive;
  elements.taskListSection.hidden = calendarActive || insightsActive;
  elements.calendarPanel.hidden = !calendarActive;
  elements.insightsPanel.hidden = !insightsActive;
  for (const button of elements.viewNav.querySelectorAll("button[data-view]")) {
    if (button.getAttribute("data-view") === activeView) { button.setAttribute("aria-current", "page"); }
    else { button.removeAttribute("aria-current"); }
  }
}

/** @param {Document} documentRef @param {ReturnType<typeof getRequiredElements>} elements @param {ViewModel} viewModel */
function renderInsights(documentRef, elements, viewModel) {
  const metrics = viewModel.metrics;
  elements.metricTotal.textContent = String(metrics.total);
  elements.metricCompleted.textContent = String(metrics.completed);
  elements.metricRate.textContent = `${metrics.completionRate}% do total`;
  elements.metricPending.textContent = String(metrics.pending);
  elements.metricToday.textContent = `${metrics.dueToday} para hoje`;
  elements.metricOverdue.textContent = String(metrics.overdue);
  elements.charts.replaceChildren(...viewModel.charts.map((chart) => {
    const figure = documentRef.createElement("figure");
    figure.className = "chart-card card";
    const caption = documentRef.createElement("figcaption");
    caption.textContent = chart.title;
    const description = documentRef.createElement("p");
    description.className = "chart-description";
    description.textContent = chart.description;
    const bars = documentRef.createElement("div");
    bars.className = "bar-chart";
    for (const item of chart.items) {
      const row = documentRef.createElement("div");
      row.className = "bar-row";
      const label = documentRef.createElement("span");
      label.textContent = item.label;
      const track = documentRef.createElement("div");
      track.className = "bar-track";
      track.setAttribute("role", "img");
      track.setAttribute("aria-label", `${item.label}: ${item.value}`);
      const bar = documentRef.createElement("span");
      bar.className = `bar bar--${item.tone}`;
      bar.style.inlineSize = `${Math.round((item.value / chart.max) * 100)}%`;
      track.append(bar);
      const value = documentRef.createElement("strong");
      value.textContent = String(item.value);
      row.append(label, track, value);
      bars.append(row);
    }
    figure.append(caption, description, bars);
    return figure;
  }));
}

/** @param {Document} documentRef @param {Task} task */
function createTaskItem(documentRef, task) {
  const item = createTaskContainer(documentRef, task);
  const text = documentRef.createElement("p");
  text.className = "task-text";
  text.textContent = task.text;

  const status = documentRef.createElement("span");
  status.className = "task-status";
  const overdue = !task.completed && task.dueDate !== null && task.dueDate < localTodayIso();
  status.textContent = task.completed ? "Concluída" : overdue ? "Atrasada" : "Pendente";
  if (overdue) {
    item.dataset.overdue = "true";
  }

  const metadata = documentRef.createElement("div");
  metadata.className = "task-metadata";
  const priority = documentRef.createElement("span");
  priority.className = `priority-badge priority-badge--${task.priority}`;
  priority.textContent = `Prioridade ${priorityLabel(task.priority)}`;
  metadata.append(priority);
  if (task.dueDate) {
    const dueDate = documentRef.createElement("time");
    dueDate.dateTime = task.dueDate;
    dueDate.textContent = `Prazo ${formatDate(task.dueDate)}`;
    metadata.append(dueDate);
  }

  const actions = documentRef.createElement("div");
  actions.className = "task-actions";
  const stateAction = task.completed ? "reopen" : "complete";
  const stateLabel = task.completed ? "Reabrir" : "Concluir";
  actions.append(
    createActionButton(documentRef, task, stateAction, stateLabel),
    createActionButton(documentRef, task, "edit", "Editar"),
    createActionButton(documentRef, task, "delete", "Excluir"),
  );

  item.append(text, status, metadata, actions);
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
  const fields = documentRef.createElement("div");
  fields.className = "task-metadata-fields";
  const priorityLabelElement = documentRef.createElement("label");
  priorityLabelElement.textContent = "Prioridade";
  const priority = documentRef.createElement("select");
  priority.name = "editPriority";
  for (const [value, text] of [["low", "Baixa"], ["medium", "Média"], ["high", "Alta"]]) {
    const option = documentRef.createElement("option");
    option.value = value;
    option.textContent = text;
    option.selected = task.priority === value;
    priority.append(option);
  }
  priorityLabelElement.append(priority);
  const dateLabel = documentRef.createElement("label");
  dateLabel.textContent = "Prazo (opcional)";
  const dueDate = documentRef.createElement("input");
  dueDate.name = "editDueDate";
  dueDate.type = "date";
  dueDate.value = task.dueDate ?? "";
  dateLabel.append(dueDate);
  fields.append(priorityLabelElement, dateLabel);
  form.insertBefore(fields, error);
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

/** @param {string} priority */
function priorityLabel(priority) {
  return ({ low: "baixa", medium: "média", high: "alta" })[priority] ?? priority;
}

/** @param {string} isoDate */
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function localTodayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {boolean} xpAwarded
 * @property {"low"|"medium"|"high"} priority
 * @property {string|null} dueDate
 */

/**
 * @typedef {object} FocusTarget
 * @property {string | null} taskId
 * @property {string} action
 */

/**
 * @typedef {object} UiHandlers
 * @property {() => void} toggleTheme
 * @property {(view: string) => void} showView
 * @property {(delta: number) => void} changeMonth
 * @property {() => void} resetMonth
 * @property {(text: string, details: {priority:string,dueDate:string}) => void} create
 * @property {(taskId: string) => void} beginEdit
 * @property {(taskId: string) => void} cancelEdit
 * @property {(taskId: string, text: string, details: {priority:string,dueDate:string}) => void} saveEdit
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
 * @property {string} activeView
 * @property {{label:string,days:Array<{dateIso:string,day:number,inCurrentMonth:boolean,isToday:boolean,tasks:Task[]}>}} calendar
 * @property {{total:number,completed:number,pending:number,overdue:number,dueToday:number,completionRate:number,pendingByPriority:{low:number,medium:number,high:number}}} metrics
 * @property {Array<{title:string,description:string,max:number,items:Array<{label:string,value:number,tone:string}>}>} charts
 */
