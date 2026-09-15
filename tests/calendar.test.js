import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendarMonth, getInitialMonth, shiftMonth } from "../js/calendar.js";

test("creates and shifts a stable month cursor across year boundaries", () => {
  assert.deepEqual(getInitialMonth(new Date(2026, 8, 14)), { year: 2026, month: 8 });
  assert.deepEqual(shiftMonth({ year: 2026, month: 0 }, -1), { year: 2025, month: 11 });
  assert.deepEqual(shiftMonth({ year: 2026, month: 11 }, 1), { year: 2027, month: 0 });
});

test("builds a six-week grid and groups due tasks by date and priority", () => {
  const tasks = [
    { id: "low", text: "Baixa", completed: false, xpAwarded: false, priority: "low", dueDate: "2026-09-14" },
    { id: "high", text: "Alta", completed: true, xpAwarded: true, priority: "high", dueDate: "2026-09-14" },
    { id: "none", text: "Sem prazo", completed: false, xpAwarded: false, priority: "medium", dueDate: null },
  ];
  const model = buildCalendarMonth(tasks, { year: 2026, month: 8 }, "2026-09-14");
  const day = model.days.find((entry) => entry.dateIso === "2026-09-14");
  assert.equal(model.label, "Setembro de 2026");
  assert.equal(model.days.length, 42);
  assert.equal(day?.isToday, true);
  assert.deepEqual(day?.tasks.map((task) => task.id), ["high", "low"]);
});
