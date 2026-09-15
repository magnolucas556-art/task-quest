/** @param {ReturnType<typeof import("./analytics.js").getTaskMetrics>} metrics */
export function buildChartSeries(metrics) {
  return [
    {
      title: "Situação das tarefas",
      description: `${metrics.completed} concluídas e ${metrics.pending} pendentes`,
      max: Math.max(metrics.total, 1),
      items: [
        { label: "Concluídas", value: metrics.completed, tone: "success" },
        { label: "Pendentes", value: metrics.pending, tone: "primary" },
        { label: "Atrasadas", value: metrics.overdue, tone: "danger" },
      ],
    },
    {
      title: "Pendências por prioridade",
      description: `${metrics.pending} tarefas pendentes distribuídas por prioridade`,
      max: Math.max(metrics.pending, 1),
      items: [
        { label: "Alta", value: metrics.pendingByPriority.high, tone: "danger" },
        { label: "Média", value: metrics.pendingByPriority.medium, tone: "warning" },
        { label: "Baixa", value: metrics.pendingByPriority.low, tone: "success" },
      ],
    },
  ];
}
