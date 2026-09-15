import assert from "node:assert/strict";
import test from "node:test";
import { buildChartSeries } from "../js/charts.js";

test("builds chart-ready values with accessible descriptions and safe scales", () => {
  const series = buildChartSeries({
    total: 0, completed: 0, pending: 0, overdue: 0, dueToday: 0,
    completionRate: 0, pendingByPriority: { low: 0, medium: 0, high: 0 },
  });
  assert.equal(series.length, 2);
  assert.equal(series[0].max, 1);
  assert.match(series[0].description, /0 concluídas/);
  assert.deepEqual(series[1].items.map((item) => item.label), ["Alta", "Média", "Baixa"]);
});
