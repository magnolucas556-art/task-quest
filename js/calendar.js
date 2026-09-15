const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/** @typedef {{year:number,month:number}} MonthCursor */
/** @typedef {{id:string,text:string,completed:boolean,xpAwarded:boolean,priority:"low"|"medium"|"high",dueDate:string|null}} CalendarTask */

/** @param {Date} [date] @returns {MonthCursor} */
export function getInitialMonth(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** @param {MonthCursor} cursor @param {number} delta @returns {MonthCursor} */
export function shiftMonth(cursor, delta) {
  const date = new Date(Date.UTC(cursor.year, cursor.month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

/** @param {CalendarTask[]} tasks @param {MonthCursor} cursor @param {string} todayIso */
export function buildCalendarMonth(tasks, cursor, todayIso) {
  const firstWeekday = new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay();
  const gridStart = new Date(Date.UTC(cursor.year, cursor.month, 1 - firstWeekday));
  const days = Array.from({ length: 42 }, (_unused, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    const dateIso = date.toISOString().slice(0, 10);
    const dayTasks = tasks.filter((task) => task.dueDate === dateIso).sort(compareTasks);
    return {
      dateIso,
      day: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === cursor.month,
      isToday: dateIso === todayIso,
      tasks: dayTasks,
    };
  });
  return { label: `${MONTH_NAMES[cursor.month]} de ${cursor.year}`, days };
}

/** @param {CalendarTask} first @param {CalendarTask} second */
function compareTasks(first, second) {
  return PRIORITY_ORDER[first.priority] - PRIORITY_ORDER[second.priority] || first.text.localeCompare(second.text, "pt-BR");
}
