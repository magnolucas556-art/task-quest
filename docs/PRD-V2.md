# Task Quest V2 — Product Requirements Document

## 1. Visão geral

O Task Quest V2 evolui o MVP acadêmico de tarefas gamificadas para uma experiência visual mais completa de planejamento pessoal. A versão preserva criação, edição, exclusão, conclusão, reabertura, XP, níveis e persistência local, adicionando contexto temporal, prioridade, calendário e leitura de desempenho.

A aplicação continua estática, executada integralmente no navegador, sem conta, backend, APIs externas ou sincronização remota.

## 2. Problema e oportunidade

A V1 permite registrar e concluir tarefas, mas oferece pouca ajuda para decidir o que fazer primeiro, identificar atrasos, planejar datas e compreender o progresso acumulado. A V2 deve tornar a lista mais útil para organização cotidiana sem transformar o projeto em uma plataforma complexa.

## 3. Objetivos

- Modernizar a interface mantendo simplicidade, responsividade e acessibilidade básica.
- Oferecer modo claro e escuro com preferência persistida.
- Permitir classificar tarefas por prioridade e prazo opcional.
- Apresentar tarefas com prazo em um calendário mensal navegável.
- Exibir métricas e gráficos locais derivados das tarefas.
- Usar animações discretas sem prejudicar usuários que preferem movimento reduzido.
- Preservar integralmente dados e comportamentos válidos da V1.

## 4. Público-alvo

Estudantes e usuários individuais que desejam organizar tarefas pessoais em um navegador, com visão rápida de prioridade, prazos e progresso, sem criar conta ou enviar dados para serviços externos.

## 5. Escopo funcional

### 5.1 Base preservada

- Criar, editar, excluir, concluir e reabrir tarefas.
- Conceder 10 XP somente na primeira conclusão.
- Subir um nível a cada 100 XP.
- Exibir nível, XP total e progresso no nível atual.
- Persistir tarefas e XP no LocalStorage.
- Manter estado seguro diante de dados inválidos ou armazenamento indisponível.

### 5.2 Redesign e tema

- Aplicar identidade visual moderna e coesa, com hierarquia clara entre progresso, tarefas, calendário e métricas.
- Disponibilizar alternância entre modo claro e escuro.
- Persistir a preferência de tema no navegador e usar a preferência do sistema no primeiro acesso.
- Preservar contraste, foco visível e estados compreensíveis sem depender apenas de cor.

### 5.3 Prioridade e prazos

- Toda tarefa possui prioridade baixa, média ou alta; novas tarefas usam prioridade média por padrão.
- O prazo é opcional e usa uma data local no formato do controle nativo do navegador.
- Prioridade e prazo podem ser definidos na criação e modificados na edição.
- Tarefas pendentes vencidas são identificadas textualmente como atrasadas.
- Concluir, reabrir ou editar não altera a regra de XP.

### 5.4 Calendário

- Disponibilizar calendário mensal dentro da mesma aplicação.
- Permitir navegar para o mês anterior, próximo mês e mês atual.
- Exibir nos dias correspondentes as tarefas que possuem prazo.
- Diferenciar o dia atual e dias fora do mês sem depender apenas de cor.
- Tarefas sem prazo permanecem na lista e não aparecem no calendário.

### 5.5 Estatísticas e gráficos

- Exibir total de tarefas, concluídas, pendentes, atrasadas e taxa de conclusão.
- Exibir distribuição por prioridade.
- Apresentar gráficos acessíveis com texto e valores equivalentes.
- Calcular todas as métricas localmente a partir do estado atual, sem persistir valores derivados.

### 5.6 Animações

- Usar transições sutis em painéis, cartões, barra de XP e feedbacks.
- Respeitar `prefers-reduced-motion`, removendo movimentos não essenciais.
- Não bloquear operações nem atrasar a persistência.

## 6. Regras de negócio

1. Uma primeira conclusão válida concede exatamente 10 XP.
2. Reabrir, recompletar ou excluir uma tarefa recompensada não reduz nem duplica XP.
3. O nível é `floor(totalXp / 100) + 1` e o progresso é `totalXp % 100`.
4. A prioridade deve ser `low`, `medium` ou `high`; o padrão é `medium`.
5. O prazo deve ser nulo ou uma data civil válida no formato `AAAA-MM-DD`.
6. Uma tarefa é atrasada quando está pendente, possui prazo e o prazo é anterior à data local atual.
7. Métricas, calendário e gráficos são derivados do estado e não são persistidos.
8. Dados válidos da V1 devem ser migrados para o esquema V2 sem perda de texto, estado ou XP.
9. Na migração, tarefas V1 recebem prioridade média e prazo nulo.
10. Dados desconhecidos ou inconsistentes continuam sendo rejeitados integralmente.
11. A preferência de tema é independente do documento de tarefas e falhas ao salvá-la não interrompem a sessão.

## 7. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF2-01 | Preservar todos os fluxos funcionais aprovados na V1. |
| RF2-02 | Alternar entre tema claro e escuro por controle acessível. |
| RF2-03 | Restaurar a preferência de tema salva ou adotar a preferência do sistema. |
| RF2-04 | Definir prioridade baixa, média ou alta ao criar uma tarefa. |
| RF2-05 | Definir prazo opcional ao criar uma tarefa. |
| RF2-06 | Editar texto, prioridade e prazo sem alterar XP conquistado. |
| RF2-07 | Identificar textualmente tarefas pendentes atrasadas. |
| RF2-08 | Migrar automaticamente um documento válido do esquema V1 para V2. |
| RF2-09 | Exibir calendário mensal com tarefas agrupadas pelo prazo. |
| RF2-10 | Navegar entre meses e retornar ao mês atual. |
| RF2-11 | Exibir métricas de total, concluídas, pendentes, atrasadas e taxa de conclusão. |
| RF2-12 | Exibir distribuição de tarefas por prioridade. |
| RF2-13 | Exibir gráficos com alternativa textual equivalente. |
| RF2-14 | Atualizar calendário, métricas e gráficos imediatamente após operações de tarefa. |
| RF2-15 | Manter navegação entre tarefas, calendário e visão geral sem recarregamento completo. |

## 8. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF2-01 | Continuar usando HTML5, CSS3, JavaScript puro e LocalStorage. |
| RNF2-02 | Não introduzir framework, bundler, backend, autenticação ou API externa. |
| RNF2-03 | Permanecer publicável em hospedagem estática por HTTPS. |
| RNF2-04 | Manter layout funcional sem rolagem horizontal em 360 px ou mais. |
| RNF2-05 | Operar os fluxos principais por teclado e manter foco visível. |
| RNF2-06 | Usar nomes acessíveis, semântica e feedbacks textuais. |
| RNF2-07 | Respeitar a preferência de movimento reduzido do sistema. |
| RNF2-08 | Inserir conteúdo do usuário somente como texto, nunca como HTML interpretado. |
| RNF2-09 | Não transmitir tarefas, preferências ou métricas. |
| RNF2-10 | Preservar os quality gates existentes e ampliar testes para os novos módulos puros. |

## 9. Critérios de aceite

1. Uma instalação com dados V1 inicia na V2 com as mesmas tarefas, estados e XP, adicionando prioridade média e prazo vazio.
2. O usuário alterna tema claro/escuro, recarrega a página e mantém a preferência.
3. Uma tarefa pode ser criada e editada com prioridade e prazo válidos.
4. Entrada inválida continua sendo recusada sem perda de dados válidos.
5. Tarefa pendente com prazo passado apresenta indicação textual de atraso.
6. O calendário agrupa tarefas na data correta e navega entre meses sem recarregar a página.
7. Métricas e gráficos correspondem exatamente ao estado atual e atualizam após cada operação.
8. Os gráficos possuem rótulos e valores textuais equivalentes.
9. A aplicação funciona em mobile e desktop sem perda funcional ou rolagem horizontal causada pelo layout.
10. O fluxo principal funciona por teclado e o tema, navegação e calendário possuem nomes acessíveis.
11. Com movimento reduzido, animações não essenciais são desativadas.
12. Os 10 XP, níveis, reabertura e proteção contra XP duplicado permanecem inalterados.
13. Nenhuma requisição externa é necessária para executar a aplicação.
14. Lint, typecheck, testes, build e port denylist passam.

## 10. Fora do escopo

- Sincronização em nuvem, contas, colaboração ou compartilhamento.
- Notificações, lembretes do sistema e recorrência de tarefas.
- Arrastar tarefas no calendário.
- Visualização semanal ou diária avançada.
- Categorias, subtarefas, anexos ou notas ricas.
- Bibliotecas de gráficos, frameworks CSS/JS ou serviços de analytics.
- Exportação/importação e PWA.

## 11. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Migração corromper dados V1 | Validar o documento legado integralmente, migrar em memória e testar preservação de XP. |
| Crescimento excessivo de módulos | Manter módulos puros por responsabilidade e DOM concentrado na fronteira visual. |
| Calendário ilegível no mobile | Grade fluida, conteúdo resumido e agenda textual complementar. |
| Tema reduzir contraste | Tokens semânticos e validação visual nos dois modos. |
| Métricas divergirem do estado | Derivação pura, sem persistência ou contadores paralelos. |
| Animações prejudicarem acessibilidade | Respeitar `prefers-reduced-motion`. |

## 12. Métricas de sucesso

- 100% dos 14 critérios de aceite V2 aprovados.
- Zero regressão nos 39 testes da V1.
- Migração V1→V2 coberta automaticamente.
- Zero dependência de produção e zero requisição externa.
- Fluxos essenciais validados em 360 px e desktop.
- Todos os quality gates terminam com sucesso.

## 13. Ordem aprovada de entrega

1. Redesign visual e tema claro/escuro.
2. Prioridade, prazos e migração de dados.
3. Calendário mensal.
4. Métricas, gráficos, animações e documentação final.
