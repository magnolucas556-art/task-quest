import assert from "node:assert/strict";
import test from "node:test";
import { getTaskMetrics } from "../js/analytics.js";

test("derives completion, due and priority metrics without mutating tasks", () => {
  const tasks = [
    { completed: true, priority: "high", dueDate: "2026-09-10" },
    { completed: false, priority: "high", dueDate: "2026-09-13" },
    { completed: false, priority: "medium", dueDate: "2026-09-14" },
    { completed: false, priority: "low", dueDate: null },
  ];
  const snapshot = structuredClone(tasks);
  assert.deepEqual(getTaskMetrics(tasks, "2026-09-14"), {
    total: 4, completed: 1, pending: 3, overdue: 1, dueToday: 1,
    completionRate: 25, pendingByPriority: { low: 1, medium: 1, high: 1 },
  });
  assert.deepEqual(tasks, snapshot);
});

test("returns safe zero metrics for an empty list", () => {
  assert.equal(getTaskMetrics([], "2026-09-14").completionRate, 0);
});
