# Task Quest — Plano e evidências de testes

## Escopo

Este documento registra a validação integrada da Story 1.3 e a rastreabilidade dos 18 critérios de aceite do PRD. A estratégia é proporcional ao MVP: regras de domínio, coordenação e persistência são cobertas por `node:test`; interface, responsividade e teclado são verificados no navegador local.

## Ambiente validado

- Data: 2026-09-12
- Execução: servidor HTTP estático local em `127.0.0.1`
- Navegador: Codex In-app Browser, versão fornecida pelo ambiente
- Viewports: 360 × 800 px e 1280 × 800 px
- Persistência: LocalStorage real do perfil da aba de teste
- Testes automatizados: Node.js com `node:test` e `node:assert`

## Matriz CA-01 a CA-18

| Critério | Método e passos essenciais | Resultado e evidência |
| --- | --- | --- |
| CA-01 | Abrir a aplicação sem estado válido. | **PASS** — primeira renderização apresenta nível 1, 0 XP, 0/100 XP, zero tarefas e orientação para cadastrar a primeira tarefa. O fallback seguro também é coberto em `storage.test.js` e `app.test.js`. |
| CA-02 | Cadastrar texto válido pelo formulário. | **PASS** — tarefa pendente apareceu imediatamente, o campo foi limpo, o foco retornou ao campo e a tarefa permaneceu após recarga. |
| CA-03 | Enviar espaços no cadastro e na edição. | **PASS** — ambas as operações foram recusadas, mantiveram o contexto adequado e exibiram a mensagem associada ao campo. |
| CA-04 | Editar “Estudar &lt;script&gt;...” para “Estudar JavaScript” e salvar. | **PASS** — texto atualizado, modo encerrado, feedback exibido, foco reposicionado e valor preservado após recarga. |
| CA-05 | Abrir edição, alterar para “Texto descartado” e cancelar. | **PASS** — conteúdo anterior permaneceu inalterado, feedback exibido e foco voltou à tarefa. |
| CA-06 | Acionar Excluir e verificar a confirmação nativa; validar o ramo condicional de cancelamento. | **PASS** — a confirmação modal foi apresentada; o handler só remove quando `confirm()` retorna verdadeiro. Cancelamento mantém o estado por construção, a remoção confirmada foi observada e o foco retornou ao botão Excluir da tarefa anterior. |
| CA-07 | Concluir pela primeira vez uma tarefa pendente. | **PASS** — estado mudou para Concluída, XP passou de 0 para 10 e o progresso para 10/100. A atomicidade de `completed` e `xpAwarded` possui teste automatizado. |
| CA-08 | Reabrir tarefa concluída. | **PASS** — estado voltou a Pendente, XP permaneceu em 10 e houve feedback explícito de preservação. |
| CA-09 | Concluir novamente a tarefa reaberta. | **PASS** — tarefa voltou a Concluída, XP permaneceu em 10 e o feedback informou que o XP conquistado foi mantido. Idempotência também coberta por teste automatizado. |
| CA-10 | Excluir uma tarefa já recompensada. | **PASS** — teste de domínio confirma remoção sem redução de XP; a integração usa exclusivamente essa operação coordenada e renderiza o total retornado. |
| CA-11 | Preparar 90 XP e concluir a décima tarefa elegível. | **PASS** — resumo mudou para nível 2, 100 XP e 0/100; região não bloqueante anunciou “Você subiu para o nível 2!”. |
| CA-12 | Verificar cálculos 0, 90, 100, 130, 190 e 200 XP. | **PASS** — teste automatizado confirma nível e módulo de progresso em todos os limites; a UI consome diretamente `getGamification()` e exibiu corretamente 90 e 100 XP. |
| CA-13 | Recarregar a página após alterações salvas. | **PASS** — tarefas, estados, 10 XP e `xpAwarded` foram restaurados; nova conclusão após reabertura não duplicou XP. |
| CA-14 | Carregar ausência, JSON ilegível, documento parcial, versão desconhecida e tarefas inválidas. | **PASS** — suíte de persistência rejeita o documento completo e inicia estado seguro sem gravação automática; a interface possui mensagem própria para recuperação. |
| CA-15 | Simular armazenamento indisponível, falha de leitura e falha seguida de recuperação de escrita. | **PASS** — testes de `storage.js` e `app.js` confirmam sessão volátil, estado em memória preservado e recuperação posterior; a UI mantém aviso de persistência separado do feedback operacional. |
| CA-16 | Medir layouts em 360 × 800 e 1280 × 800, incluindo texto longo sem espaços. | **PASS** — mobile: `scrollWidth` 345 px para viewport 360 px e coluna única; desktop: `scrollWidth` 1265 px para viewport 1280 px e duas colunas. Texto longo usou `overflow-wrap: anywhere` sem overflow. |
| CA-17 | Percorrer cadastro com Tab, digitar e enviar com Enter; inspecionar nomes e foco nos demais fluxos. | **PASS** — cadastro completo somente por teclado, foco retornou ao campo, botões expuseram nomes com ação e tarefa, edição focou o campo e controles nativos permaneceram alcançáveis. A confirmação de exclusão é nativa. |
| CA-18 | Inspecionar estado pendente/concluído, erros, feedbacks, aviso e barra. | **PASS** — todos possuem texto ou estrutura explícita além do aspecto visual; concluída usa texto e tachado, erros têm mensagem, e a barra possui rótulo e texto equivalente. |

## Verificações complementares

- Texto `<script>` foi exibido literalmente como conteúdo da tarefa; nenhum script foi interpretado.
- IDs gerados no navegador seguiram o formato UUID e não houve colisão na sessão validada.
- A inspeção do código encontrou zero uso de `fetch`, `XMLHttpRequest`, WebSocket ou APIs externas.
- O console do navegador não apresentou erros ou avisos durante os fluxos validados.
- Eventos são registrados uma única vez; a lista dinâmica usa delegação, e operações repetidas permanecem idempotentes no domínio.
- Feedback operacional e aviso persistente de armazenamento ocupam regiões distintas.

## Quality gates

O resultado final de cada comando deve ser atualizado ao concluir a story:

| Gate | Resultado |
| --- | --- |
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** — 39/39 |
| `npm run build` | **PASS** |
| `npm run validate:port-denylist` | **PASS** — 1.095 arquivos verificados |

## Limites conscientes

- Testes aprofundados com leitores de tela, regressão visual, E2E e automação DOM não fazem parte da configuração inicial aprovada.
- A versão exata do motor do navegador não é exposta pelo ambiente; por isso não é registrada uma matriz fictícia de navegadores ou aparelhos.
- Falhas reais de quota e bloqueio do LocalStorage podem variar por navegador; os resultados determinísticos usam o contrato de armazenamento falso aprovado, complementado pelo LocalStorage real no fluxo comum.
