# Task Quest V2 — Plano de implementação

## Princípios

- Preservar a branch `main`; todo trabalho ocorre em `feature/task-quest-v2`.
- Manter aplicação estática e sem dependências de produção.
- Evoluir o documento `taskQuest.state` de schema 1 para 2 com migração validada.
- Derivar calendário e métricas em tempo de execução.
- Manter regras de XP exclusivamente em `domain.js`.
- Usar APIs nativas, HTML semântico e CSS mobile-first.

## Arquitetura-alvo

```text
index.html
css/style.css
js/
  app.js          coordenação e estado transitório
  domain.js       tarefas, validação, XP e migração de modelo
  storage.js      persistência e migração do documento
  ui.js           DOM, eventos, renderização e foco
  theme.js        preferência e aplicação do tema
  calendar.js     modelo mensal derivado
  analytics.js    métricas derivadas
  charts.js       modelos acessíveis para gráficos
tests/
  *.test.js       módulos puros e coordenação
```

O grafo permanece acíclico: `app.js` compõe os módulos; módulos de domínio não importam UI; `ui.js` recebe um view model pronto. `theme.js` atua somente na preferência visual. Não haverá roteador: tarefas, calendário e visão geral são painéis da mesma página.

## Modelo V2

```json
{
  "schemaVersion": 2,
  "totalXp": 0,
  "tasks": [
    {
      "id": "uuid",
      "text": "Estudar JavaScript",
      "completed": false,
      "xpAwarded": false,
      "priority": "medium",
      "dueDate": "2026-09-20"
    }
  ]
}
```

`dueDate` também pode ser `null`. Métricas e calendário não são armazenados. A preferência visual usa `taskQuest.theme`, com `light` ou `dark`.

## Etapa 2.1 — Redesign e tema

- Reestruturar a página como app shell responsivo com navegação interna.
- Criar tokens CSS de cor, espaço, raio e sombra para os dois temas.
- Implementar `theme.js` com preferência do sistema no primeiro acesso e persistência defensiva.
- Manter todas as operações V1 disponíveis durante o redesign.
- Adicionar teste do módulo de tema.
- Commit planejado: `feat: redesign interface and add theme support [Story 2.1]`.

## Etapa 2.2 — Prioridade, prazos e migração

- Evoluir `Task` e `AppState` para schema 2.
- Adicionar validação de prioridade e data civil.
- Migrar documentos V1 válidos para V2 sem perda de XP.
- Ampliar criação, edição e cartões de tarefa.
- Cobrir defaults, validação, atraso e migração.
- Commit planejado: `feat: add task priorities and due dates [Story 2.2]`.

## Etapa 2.3 — Calendário

- Implementar `calendar.js` como módulo puro.
- Criar grade mensal de 42 células, navegação anterior/próximo/hoje e agenda resumida.
- Incluir tarefas somente quando possuírem prazo.
- Validar viradas de mês/ano, hoje, múltiplas tarefas e mobile.
- Commit planejado: `feat: add monthly task calendar [Story 2.3]`.

## Etapa 2.4 — Métricas, gráficos e animações

- Implementar métricas puras em `analytics.js`.
- Gerar modelos de barras em `charts.js` e renderizar equivalentes textuais.
- Adicionar painel de visão geral e animações discretas.
- Desativar movimentos não essenciais com `prefers-reduced-motion`.
- Atualizar README e plano de testes V2.
- Commit planejado: `feat: add analytics charts and motion [Story 2.4]`.

## Estratégia de testes

- Preservar todos os testes da V1.
- Testar domínio, migração, armazenamento, calendário, métricas, gráficos e tema com `node:test`.
- Validar manualmente os fluxos integrados por HTTP em 360 px e desktop.
- Verificar teclado, foco, nomes acessíveis, contraste funcional e movimento reduzido.
- Executar após cada etapa: lint, typecheck, testes, build e port denylist.

## Critério de conclusão

Cada etapa deve manter a aplicação executável e os gates verdes. A entrega termina com commits locais claros na feature branch, árvore limpa e nenhum push ou merge.
