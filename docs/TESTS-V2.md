# Task Quest V2 — Plano e evidências de testes

## Escopo

Esta matriz cobre os 14 critérios de aceite do PRD V2 e a regressão da V1. As regras puras, migração, persistência e modelos visuais são validados por `node:test`; responsividade, teclado e apresentação foram verificadas no navegador local em 1280 × 800 px e 360 × 800 px.

## Matriz de critérios V2

| Critério | Evidência | Resultado |
| --- | --- | --- |
| CA2-01 | App shell mantém formulário, lista, progresso e operações existentes. | PASS |
| CA2-02 | `theme.test.js` cobre preferência salva, sistema e falha de storage. | PASS |
| CA2-03 | Tokens CSS dos dois temas e estados textuais/foco visível. | PASS |
| CA2-04 | `domain.test.js` cobre prioridade padrão e explícita. | PASS |
| CA2-05 | Validação estrita de data ISO e prazo opcional. | PASS |
| CA2-06 | Edição preserva conclusão, recompensa e XP. | PASS |
| CA2-07 | Estado atrasado combina regra temporal, texto e estilo não dependente só de cor. | PASS |
| CA2-08 | `storage.test.js` cobre migração V1→V2 e segunda leitura sem nova migração. | PASS |
| CA2-09 | `calendar.test.js` cobre grade de 42 dias, agrupamento e ordem. | PASS |
| CA2-10 | Navegação anterior, seguinte e hoje opera sem reload. | PASS |
| CA2-11 | `analytics.test.js` cobre totais, taxa, prazos e prioridades. | PASS |
| CA2-12 | `charts.test.js` e UI garantem descrição, rótulo e valor para cada barra. | PASS |
| CA2-13 | CSS inclui animações curtas e desativação com `prefers-reduced-motion`. | PASS |
| CA2-14 | Gates completos, zero dependências de produção e deploy estático preservado. | PASS |

## Regressão e segurança

- O conjunto V1 permanece na suíte e cobre XP, níveis, idempotência, CRUD e falhas do LocalStorage.
- Todo texto de tarefa continua inserido com `textContent`, sem interpretação de HTML.
- Não há chamadas de rede, autenticação, backend ou armazenamento remoto.
- Métricas, calendário e gráficos são derivados do estado; não aumentam o documento persistido.
- `xpAwarded` continua sendo a fonte de idempotência da recompensa.

## Gates esperados

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run validate:port-denylist
```

## Resultado final

- Lint: **PASS**.
- Typecheck: **PASS**.
- Testes: **PASS — 51/51**.
- Build: **PASS**.
- Port denylist: **PASS — 1.095 arquivos verificados**.
- `npm audit`: **PASS — 0 vulnerabilidades**.
- Console do navegador: **PASS — sem erros ou avisos**.
- Responsividade: **PASS — `scrollWidth` de 345 px para viewport de 360 px; calendário com 278 px de largura interna e sem overflow**.
- Persistência: **PASS — tema, tarefa V2 e schema 2 preservados após recarga**.
