/** @typedef {{completed:boolean,priority:"low"|"medium"|"high",dueDate:string|null}} AnalyticsTask */

/** @param {AnalyticsTask[]} tasks @param {string} todayIso */
export function getTaskMetrics(tasks, todayIso) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter((task) => !task.completed && task.dueDate !== null && task.dueDate < todayIso).length;
  const dueToday = tasks.filter((task) => !task.completed && task.dueDate === todayIso).length;
  const pendingByPriority = { low: 0, medium: 0, high: 0 };
  for (const task of tasks) {
    if (!task.completed) { pendingByPriority[task.priority] += 1; }
  }
  return {
    total, completed, pending, overdue, dueToday,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    pendingByPriority,
  };
}
