# Task Quest — Product Requirements Document (PRD)

| Campo | Valor |
| --- | --- |
| Produto | Task Quest |
| Documento | Product Requirements Document (PRD) |
| Versão | 1.0 |
| Data | 11/09/2026 |
| Status | Aprovado |
| Responsáveis | Business Analyst / Product Manager |

## 1. Visão geral do produto

Task Quest é uma aplicação web de gerenciamento de tarefas pessoais que utiliza uma mecânica simples de gamificação para tornar a conclusão de atividades mais visível e motivadora. O usuário poderá cadastrar, editar, excluir, concluir e reabrir tarefas em uma interface única e responsiva.

Cada tarefa concluída pela primeira vez concederá 10 pontos de experiência (XP). O XP acumulado determinará o nível atual do usuário e o avanço até o próximo nível. Tarefas e progresso serão armazenados localmente no navegador, sem necessidade de conta, servidor ou conexão com serviços externos.

O MVP será desenvolvido com HTML5, CSS3, JavaScript e LocalStorage. Esta versão busca validar se uma progressão simples, integrada ao fluxo de tarefas, torna a experiência mais clara e estimulante sem aumentar desnecessariamente a complexidade do produto.

## 2. Problema que o produto resolve

Gerenciadores de tarefas convencionais permitem registrar atividades, mas frequentemente oferecem pouco retorno imediato pela conclusão. Para pessoas que têm dificuldade em manter constância, visualizar progresso ou transformar obrigações em pequenas conquistas, uma lista puramente funcional pode não ser suficientemente motivadora.

O Task Quest resolve esse problema associando cada conclusão a uma recompensa previsível e a uma progressão visível. A proposta não substitui metodologias avançadas de produtividade; ela oferece um ciclo simples de registrar, executar, concluir e perceber evolução.

## 3. Objetivo

### 3.1 Objetivo do produto

Disponibilizar uma experiência simples de gerenciamento de tarefas pessoais na qual a conclusão de atividades gere progresso mensurável por meio de XP e níveis.

### 3.2 Objetivos do MVP

- Permitir o gerenciamento completo do ciclo básico de tarefas.
- Recompensar de forma consistente a primeira conclusão de cada tarefa.
- Exibir claramente XP total, nível atual e progresso até o próximo nível.
- Preservar tarefas e progresso entre sessões no mesmo navegador.
- Oferecer uma experiência funcional em desktop e dispositivos móveis.
- Validar o funcionamento integrado entre gerenciamento de tarefas, persistência local e gamificação.

## 4. Público-alvo

### 4.1 Público primário

Pessoas que desejam organizar tarefas pessoais ou rotinas simples e que se beneficiam de feedback visual e sensação de progressão para manter a motivação.

### 4.2 Necessidades principais

- Registrar tarefas rapidamente.
- Identificar o que está pendente ou concluído.
- Corrigir ou remover tarefas com facilidade.
- Perceber uma recompensa imediata ao concluir uma atividade.
- Retomar a lista e o progresso em uma sessão posterior no mesmo navegador.
- Usar a aplicação tanto em telas de desktop quanto em dispositivos móveis.

### 4.3 Contexto de uso do MVP

Uso individual, sem conta e em um único navegador ou perfil por vez. Colaboração, sincronização entre dispositivos e uso multiusuário não fazem parte desta versão.

## 5. Escopo do MVP

O MVP compreende:

- Aplicação web em página única e responsiva.
- Cadastro de tarefas com conteúdo textual válido.
- Listagem das tarefas cadastradas.
- Edição com opções de salvar e cancelar.
- Exclusão mediante confirmação.
- Marcação de tarefa como concluída.
- Reabertura de tarefa concluída.
- Identificação visual dos estados pendente e concluído.
- Concessão única de 10 XP por tarefa.
- Cálculo e exibição do XP total.
- Cálculo e exibição do nível atual.
- Barra e texto de progresso do nível atual.
- Feedback visual mínimo para as ações principais e para a subida de nível.
- Estado vazio quando não houver tarefas.
- Mensagens mínimas para entrada inválida e falha de persistência.
- Persistência local das tarefas e do XP no navegador.
- Recuperação segura diante de dados locais ausentes ou inválidos.
- Acessibilidade básica obrigatória.

## 6. Funcionalidades obrigatórias

### 6.1 Gerenciamento de tarefas

- Cadastrar uma nova tarefa.
- Exibir tarefas cadastradas e seus estados.
- Editar o conteúdo de uma tarefa.
- Cancelar uma edição sem alterar o conteúdo anterior.
- Excluir uma tarefa após confirmação.
- Marcar uma tarefa pendente como concluída.
- Reabrir uma tarefa concluída.

### 6.2 Gamificação

- Conceder 10 XP na primeira conclusão de cada tarefa.
- Impedir a concessão repetida de XP para a mesma tarefa.
- Exibir XP total acumulado.
- Exibir nível atual.
- Exibir o progresso dentro do nível atual em formato visual e textual.
- Informar a subida de nível sem bloquear o uso da aplicação.

### 6.3 Persistência

- Salvar tarefas e XP no LocalStorage após alterações relevantes.
- Restaurar o estado salvo ao abrir ou recarregar a aplicação.
- Preservar a informação de que uma tarefa já concedeu XP.
- Tratar dados ausentes ou inválidos sem impedir o carregamento da aplicação.
- Informar quando uma alteração não puder ser persistida.

### 6.4 Interface e experiência

- Manter o fluxo principal em uma única página.
- Adaptar conteúdo e controles a desktop e dispositivos móveis.
- Exibir estado vazio com orientação para cadastrar a primeira tarefa.
- Oferecer feedback visual mínimo para criar, editar, excluir, concluir, reabrir e subir de nível.
- Atender aos requisitos básicos de acessibilidade definidos neste documento.

## 7. Regras de negócio

| ID | Regra |
| --- | --- |
| RN-01 | O usuário inicia no nível 1 e com 0 XP quando não há progresso válido armazenado. |
| RN-02 | Cada tarefa concede exatamente 10 XP somente em sua primeira transição para o estado concluído. |
| RN-03 | Cada tarefa deve manter a informação de que sua recompensa de XP já foi concedida. |
| RN-04 | Reabrir uma tarefa não reduz o XP total acumulado. |
| RN-05 | Concluir novamente uma tarefa que já concedeu recompensa não concede XP adicional. |
| RN-06 | Excluir uma tarefa concluída não remove o XP já conquistado. |
| RN-07 | O usuário sobe um nível a cada 100 XP acumulados. |
| RN-08 | O nível atual é calculado por `piso(XP total / 100) + 1`. |
| RN-09 | O progresso do nível atual corresponde a `XP total módulo 100`, em uma escala de 0 a 100 XP. |
| RN-10 | XP total e progresso do nível atual são informações distintas e devem ser apresentados separadamente. |
| RN-11 | Nível e progresso são derivados do XP total; não constituem fontes independentes de verdade. |
| RN-12 | Uma tarefa só pode ser salva quando possuir conteúdo textual válido após a remoção de espaços nas extremidades. |
| RN-13 | Cancelar uma edição mantém os dados anteriores da tarefa. |
| RN-14 | A exclusão só ocorre após confirmação explícita do usuário. |
| RN-15 | Na ausência de dados válidos no navegador, a aplicação inicia em um estado seguro, com lista vazia, 0 XP e nível 1. |

## 8. Requisitos funcionais

| ID | Requisito funcional |
| --- | --- |
| RF-01 | O sistema deve carregar tarefas e XP total válidos armazenados no navegador ao iniciar. |
| RF-02 | O sistema deve permitir cadastrar uma tarefa com conteúdo textual válido. |
| RF-03 | O sistema deve exibir todas as tarefas cadastradas com seus respectivos estados. |
| RF-04 | O sistema deve permitir iniciar a edição de uma tarefa existente. |
| RF-05 | O sistema deve permitir salvar uma edição válida. |
| RF-06 | O sistema deve permitir cancelar a edição sem modificar os dados anteriores. |
| RF-07 | O sistema deve solicitar confirmação antes de excluir uma tarefa. |
| RF-08 | O sistema deve excluir a tarefa quando a exclusão for confirmada. |
| RF-09 | O sistema deve permitir marcar uma tarefa pendente como concluída. |
| RF-10 | O sistema deve permitir reabrir uma tarefa concluída. |
| RF-11 | O sistema deve acrescentar 10 XP ao total quando uma tarefa for concluída pela primeira vez. |
| RF-12 | O sistema deve impedir XP adicional ao concluir novamente uma tarefa que já foi recompensada. |
| RF-13 | O sistema deve calcular e exibir o nível atual a partir do XP total. |
| RF-14 | O sistema deve exibir separadamente o XP total e o progresso do nível atual. |
| RF-15 | O sistema deve exibir a progressão do nível por barra e por texto no formato equivalente a “30/100 XP para o próximo nível”. |
| RF-16 | O sistema deve apresentar uma mensagem não bloqueante quando o usuário subir de nível. |
| RF-17 | O sistema deve salvar no LocalStorage tarefas, estados, controle de recompensa e XP total após cada alteração correspondente. |
| RF-18 | O sistema deve restaurar os dados persistidos após o recarregamento da página. |
| RF-19 | O sistema deve iniciar em um estado seguro quando os dados locais estiverem ausentes ou inválidos. |
| RF-20 | O sistema deve exibir uma mensagem de falha quando não conseguir persistir uma alteração. |
| RF-21 | O sistema deve rejeitar cadastro ou edição sem conteúdo textual válido e informar o motivo. |
| RF-22 | O sistema deve exibir um estado vazio quando não houver tarefas, orientando o cadastro da primeira tarefa. |
| RF-23 | O sistema deve atualizar visualmente a lista após criar, editar, excluir, concluir ou reabrir uma tarefa. |
| RF-24 | O sistema deve funcionar em uma única página, sem recarregamento obrigatório para executar as operações principais. |

## 9. Requisitos não funcionais

### 9.1 Tecnologia e arquitetura do MVP

| ID | Requisito não funcional |
| --- | --- |
| RNF-01 | A aplicação deve utilizar HTML5, CSS3 e JavaScript como tecnologias do MVP. |
| RNF-02 | A aplicação deve executar integralmente no navegador, sem backend obrigatório. |
| RNF-03 | A persistência deve utilizar LocalStorage, sem banco de dados remoto. |
| RNF-04 | O MVP não deve depender de autenticação, API externa ou serviço de sincronização. |

### 9.2 Responsividade e compatibilidade

| ID | Requisito não funcional |
| --- | --- |
| RNF-05 | A interface deve se adaptar a telas de desktop e dispositivos móveis sem perda das funcionalidades obrigatórias. |
| RNF-06 | O conteúdo não deve exigir rolagem horizontal nas larguras de tela suportadas. |
| RNF-07 | A aplicação deve funcionar em navegadores modernos que ofereçam suporte às tecnologias definidas para o MVP. |

### 9.3 Usabilidade e feedback

| ID | Requisito não funcional |
| --- | --- |
| RNF-08 | As operações principais devem atualizar a interface sem recarregamento completo da página. |
| RNF-09 | Após criar, a nova tarefa deve aparecer na lista e o campo de entrada deve ser limpo. |
| RNF-10 | Após editar, o novo conteúdo deve aparecer e o modo de edição deve ser encerrado. |
| RNF-11 | Após excluir, a tarefa deve desaparecer da lista. |
| RNF-12 | Após concluir ou reabrir, o novo estado deve ser imediatamente distinguível. |
| RNF-13 | O aviso de subida de nível deve ser perceptível e não bloquear a continuidade do uso. |
| RNF-14 | Mensagens de erro devem preservar os dados válidos e permanecer visíveis o suficiente para serem percebidas. |

### 9.4 Acessibilidade básica

| ID | Requisito não funcional |
| --- | --- |
| RNF-15 | A interface deve utilizar estrutura HTML semântica. |
| RNF-16 | Todos os controles necessários ao fluxo principal devem ser operáveis por teclado. |
| RNF-17 | Elementos interativos devem apresentar foco visível. |
| RNF-18 | Campos e controles devem possuir rótulos ou nomes acessíveis compreensíveis. |
| RNF-19 | Estados, ações e feedbacks não devem depender exclusivamente de cor. |
| RNF-20 | A barra de progresso deve possuir texto equivalente. |
| RNF-21 | Mensagens de erro devem estar associadas ao contexto que as originou. |

### 9.5 Confiabilidade, privacidade e dados

| ID | Requisito não funcional |
| --- | --- |
| RNF-22 | Dados locais ausentes ou inválidos não devem causar interrupção total da aplicação. |
| RNF-23 | Uma falha de persistência deve ser comunicada sem representar a alteração como permanentemente salva. |
| RNF-24 | A aplicação não deve transmitir tarefas ou progresso para serviços externos no MVP. |
| RNF-25 | O produto deve comunicar explicitamente a natureza local do armazenamento e não prometer sincronização, backup ou recuperação em nuvem. |

## 10. Critérios de aceite

### CA-01 — Estado inicial

- **Dado** que não existem dados válidos armazenados,
- **quando** a aplicação é aberta,
- **então** deve exibir lista vazia, 0 XP, nível 1, progresso 0/100 XP e orientação para cadastrar a primeira tarefa.

### CA-02 — Cadastro válido

- **Dado** um conteúdo textual válido,
- **quando** o usuário cadastrar a tarefa,
- **então** ela deve aparecer como pendente, o campo deve ser limpo e os dados devem ser persistidos.

### CA-03 — Entrada inválida

- **Dado** um campo vazio ou composto apenas por espaços,
- **quando** o usuário tentar cadastrar ou salvar uma edição,
- **então** a operação deve ser recusada e uma mensagem contextual deve informar que é necessário fornecer conteúdo válido.

### CA-04 — Edição

- **Dado** uma tarefa existente,
- **quando** o usuário salvar uma edição válida,
- **então** o conteúdo atualizado deve ser exibido, o modo de edição deve ser encerrado e a alteração deve ser persistida.

### CA-05 — Cancelamento da edição

- **Dado** que uma tarefa está sendo editada,
- **quando** o usuário cancelar a edição,
- **então** o conteúdo anterior deve permanecer inalterado.

### CA-06 — Exclusão

- **Dado** uma tarefa existente,
- **quando** o usuário solicitar sua exclusão,
- **então** o sistema deve pedir confirmação e só remover a tarefa se a ação for confirmada.

### CA-07 — Primeira conclusão e XP

- **Dado** uma tarefa pendente que ainda não concedeu recompensa,
- **quando** ela for concluída,
- **então** seu estado deve mudar para concluído, o XP total deve aumentar exatamente 10 pontos e a recompensa deve ser registrada como concedida.

### CA-08 — Reabertura sem perda de XP

- **Dado** uma tarefa concluída,
- **quando** ela for reaberta,
- **então** seu estado deve mudar para pendente e o XP total deve permanecer inalterado.

### CA-09 — Prevenção de XP duplicado

- **Dado** uma tarefa reaberta que já concedeu XP,
- **quando** ela for concluída novamente,
- **então** seu estado deve mudar para concluído sem acréscimo de XP.

### CA-10 — Exclusão sem perda de XP

- **Dado** uma tarefa que já concedeu XP,
- **quando** sua exclusão for confirmada,
- **então** a tarefa deve ser removida e o XP total deve permanecer inalterado.

### CA-11 — Subida de nível

- **Dado** que o usuário possui 90 XP no nível 1,
- **quando** concluir pela primeira vez uma tarefa elegível,
- **então** deve passar a possuir 100 XP, nível 2 e progresso 0/100 XP, recebendo uma mensagem não bloqueante de subida de nível.

### CA-12 — Progresso entre níveis

- **Dado** que o usuário possui 130 XP,
- **quando** o resumo de progresso for exibido,
- **então** deve mostrar nível 2, XP total igual a 130 e progresso igual a 30/100 XP para o próximo nível.

### CA-13 — Persistência entre sessões

- **Dado** que tarefas e XP foram alterados e salvos com sucesso,
- **quando** a página for recarregada no mesmo navegador e perfil,
- **então** tarefas, estados, controle de recompensa e XP total devem ser restaurados sem duplicar recompensas.

### CA-14 — Dados locais inválidos

- **Dado** que o armazenamento contém dados ausentes, incompletos ou inválidos,
- **quando** a aplicação tentar carregá-los,
- **então** deve iniciar em um estado seguro sem deixar de funcionar.

### CA-15 — Falha de persistência

- **Dado** que o navegador não permite salvar uma alteração,
- **quando** ocorrer uma operação que exija persistência,
- **então** a interface deve informar que os dados não puderam ser salvos e que a alteração recente pode não permanecer após sair ou recarregar.

### CA-16 — Responsividade

- **Dado** o uso em desktop ou dispositivo móvel,
- **quando** a página for exibida,
- **então** conteúdo e controles devem se reorganizar sem rolagem horizontal e todas as funcionalidades obrigatórias devem permanecer disponíveis.

### CA-17 — Acessibilidade básica

- **Dado** o uso somente por teclado,
- **quando** o usuário percorrer e acionar o fluxo principal,
- **então** deve conseguir cadastrar, editar, cancelar, concluir, reabrir, solicitar ou cancelar exclusão, com foco visível e nomes acessíveis nos controles.

### CA-18 — Estados e feedbacks perceptíveis

- **Dado** qualquer estado ou feedback obrigatório,
- **quando** ele for apresentado,
- **então** seu significado deve ser compreensível sem depender exclusivamente de cor.

## 11. Funcionalidades fora do escopo inicial

- Cadastro, login e perfis de usuário.
- Sincronização entre navegadores ou dispositivos.
- Backend, banco de dados remoto ou APIs próprias.
- Backup ou recuperação em nuvem.
- Compartilhamento, colaboração ou atribuição de tarefas.
- Categorias, etiquetas, projetos ou subtarefas.
- Prioridades, prazos, lembretes ou recorrência.
- Pesquisa, filtros e ordenação avançada.
- Anexos, comentários ou notas avançadas.
- Recompensas além de XP e níveis, como moedas, itens, conquistas ou ranking.
- Personalização de avatar, tema ou perfil.
- Notificações push ou integração com calendário.
- Painéis analíticos e histórico detalhado de produtividade.
- Importação ou exportação de dados.
- Aplicativo móvel nativo ou funcionamento como PWA.
- Internacionalização.
- Definição detalhada de cores, tipografia, ilustrações ou branding.

Esses itens poderão ser avaliados após a validação do MVP, mas não constituem compromisso de roadmap.

## 12. Riscos

| ID | Risco | Probabilidade | Impacto | Mitigação no MVP |
| --- | --- | --- | --- | --- |
| R-01 | Perda de dados quando o usuário limpa o navegador, usa modo privado ou troca de dispositivo. | Alta | Alto | Delimitar o armazenamento como local e não prometer backup ou sincronização. |
| R-02 | LocalStorage indisponível, bloqueado ou sem capacidade para persistir. | Baixa | Alto | Tratar falhas, preservar a interface funcional e informar que alterações recentes podem não permanecer. |
| R-03 | Dados locais inválidos impedirem a inicialização. | Média | Alto | Validar os dados carregados e recuperar um estado inicial seguro. |
| R-04 | XP duplicado ao reabrir e concluir novamente a mesma tarefa. | Média | Alto | Manter por tarefa um controle persistente de recompensa já concedida e cobrir o cenário nos critérios de aceite. |
| R-05 | Divergência entre XP, nível e barra de progresso. | Média | Alto | Utilizar o XP total como fonte de verdade e derivar nível e progresso. |
| R-06 | Exclusão acidental de tarefas. | Média | Médio | Exigir confirmação antes da remoção. |
| R-07 | A gamificação ser insuficiente para melhorar motivação ou constância. | Média | Médio | Validar o ciclo básico com usuários antes de ampliar recompensas e mecânicas. |
| R-08 | A interface se tornar carregada em telas pequenas devido às ações por tarefa. | Média | Médio | Reorganizar controles responsivamente e testar todos os fluxos no mobile. |
| R-09 | Feedback visual ou estados serem inacessíveis. | Média | Médio | Exigir operação por teclado, foco visível, nomes acessíveis e comunicação que não dependa apenas de cor. |
| R-10 | Crescimento prematuro do escopo comprometer a simplicidade do MVP. | Média | Alto | Manter como obrigatórias somente as funcionalidades definidas neste PRD e submeter expansões a nova priorização. |

## 13. Métricas e critérios de sucesso

Como o MVP não possui contas, backend ou analytics, as métricas iniciais serão verificadas por testes funcionais e validação observacional. Métricas de retenção e uso real dependerão de instrumentação futura e não serão inferidas a partir do LocalStorage.

### 13.1 Critérios de sucesso do MVP

| Métrica ou critério | Meta |
| --- | --- |
| Cobertura dos fluxos obrigatórios | 100% dos critérios de aceite aprovados. |
| Correção da recompensa | 10 XP concedidos em 100% das primeiras conclusões válidas testadas. |
| Prevenção de recompensa duplicada | 0 concessões adicionais nos cenários testados de reabertura e nova conclusão. |
| Correção de nível e progresso | 100% dos casos de fronteira testados, incluindo 0, 90, 100, 130 e múltiplos de 100 XP, com resultado esperado. |
| Persistência | 100% dos cenários válidos testados restaurados após recarregamento no mesmo navegador e perfil. |
| Recuperação de dados inválidos | Aplicação permanece utilizável em 100% dos cenários de dados locais inválidos definidos para teste. |
| Operações principais | Cadastro, edição, cancelamento, exclusão, conclusão e reabertura executados sem recarregamento completo da página. |
| Responsividade | Todos os fluxos obrigatórios utilizáveis nos cenários de desktop e mobile definidos para validação, sem rolagem horizontal. |
| Acessibilidade básica | Fluxo principal concluído somente por teclado, com foco visível, nomes acessíveis e estados que não dependem apenas de cor. |
| Estabilidade | Nenhum defeito crítico aberto que impeça o gerenciamento de tarefas, o cálculo de XP ou a persistência local. |

### 13.2 Aprendizados esperados

- Verificar se os usuários compreendem a diferença entre XP total e progresso do nível.
- Verificar se a recompensa de 10 XP e a subida de nível são percebidas sem interromper o fluxo.
- Verificar se a página única é suficiente para executar o ciclo completo de tarefas.
- Identificar dificuldades de uso em desktop, mobile e navegação por teclado.
- Determinar, antes de expandir o produto, se a gamificação básica agrega valor percebido ao gerenciamento de tarefas.

## Premissas e limitações consolidadas

- O MVP é individual e local-first.
- O XP é um progresso acumulado e não representa o total de tarefas atualmente existentes.
- O navegador é a única fonte de persistência nesta versão.
- Troca de dispositivo, perfil ou navegador não transporta dados.
- Limpeza do armazenamento pode remover tarefas e progresso.
- Não há garantia de backup, sincronização ou recuperação.
- Estrutura do repositório, organização interna dos arquivos e ferramentas de teste serão definidas no planejamento técnico posterior.

## Rastreabilidade dos requisitos obrigatórios

| Requisito de origem | Cobertura principal |
| --- | --- |
| Cadastrar tarefas | RF-02, CA-02 e CA-03 |
| Editar tarefas | RF-04 a RF-06, CA-04 e CA-05 |
| Excluir tarefas | RF-07 e RF-08, CA-06 e CA-10 |
| Marcar tarefas como concluídas | RF-09, CA-07 |
| Conceder 10 XP por tarefa concluída | RN-02, RF-11, CA-07 |
| Subir um nível a cada 100 XP | RN-07 a RN-09, RF-13 a RF-15, CA-11 e CA-12 |
| Exibir nível atual | RF-13, CA-11 e CA-12 |
| Exibir barra de progresso de XP | RF-15, RNF-20, CA-12 e CA-18 |
| Salvar tarefas e progresso no navegador | RF-17 a RF-20, CA-13 a CA-15 |
| Interface responsiva | RNF-05 e RNF-06, CA-16 |
| HTML5, CSS3, JavaScript e LocalStorage | RNF-01 a RNF-04 |

## Aprovação e próximos passos

Este PRD define o escopo de produto do Task Quest para o MVP. Qualquer alteração nas regras de XP, persistência, funcionalidades obrigatórias ou limites de escopo deverá ser registrada em uma nova versão do documento antes da implementação.

Após a aprovação formal, os próximos artefatos recomendados são o planejamento técnico, a definição de UX/UI em nível de implementação e a decomposição do escopo em stories com critérios rastreáveis a este PRD.
