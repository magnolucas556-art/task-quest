# Task Quest — Arquitetura Frontend do MVP

| Campo | Valor |
| --- | --- |
| Documento | Arquitetura Frontend |
| Versão | 1.0 |
| Data | 11/09/2026 |
| Status | Draft consolidado para revisão |
| Fonte principal | `docs/PRD.md` aprovado |
| Tipo de solução | Aplicação web estática de página única |

## Escopo e princípios

Este documento define como implementar o frontend do Task Quest sem alterar os requisitos aprovados no PRD. A solução será executada integralmente no navegador e utilizará somente HTML5, CSS3, JavaScript puro e LocalStorage em produção.

Não fazem parte da arquitetura: backend, banco de dados remoto, autenticação, APIs externas, roteamento, framework JavaScript, biblioteca de componentes, bundler ou dependência de produção.

Os princípios orientadores são:

- simplicidade proporcional a um MVP acadêmico;
- separação explícita entre interface, domínio e persistência;
- regras de negócio testáveis sem navegador;
- uma única fonte de verdade para o estado da sessão;
- degradação segura quando a persistência estiver indisponível;
- acessibilidade básica incorporada à estrutura;
- nenhuma funcionalidade além do PRD.

## 1. Visão geral da solução

O Task Quest será uma aplicação estática de página única. O navegador carregará um documento HTML, um arquivo CSS e quatro módulos JavaScript nativos. Não haverá comunicação de rede necessária ao funcionamento da aplicação.

A solução será dividida em quatro responsabilidades:

```text
Interface do usuário (ui.js)
           ↑ ↓
Coordenação da aplicação (app.js)
       ↙             ↘
Regras e estado       Persistência
  (domain.js)         (storage.js)
```

O fluxo geral será:

```text
Intenção do usuário
→ coordenação em app.js
→ validação e transição em domain.js
→ atualização do estado em memória
→ tentativa de gravação por storage.js
→ renderização e feedback por ui.js
```

As regras do domínio serão síncronas e puras sempre que possível. Isso permite que cadastro, edição, exclusão, conclusão, reabertura, XP e níveis sejam validados por comandos de teste antes da integração visual, em conformidade com a orientação CLI-first do projeto.

## 2. Estrutura de diretórios

```text
TASK-QUEST/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── domain.js
│   ├── storage.js
│   └── ui.js
├── tests/
│   ├── domain.test.js
│   └── storage.test.js
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── STORIES.md
│   ├── TESTS.md
│   └── BUGFIX.md
├── package.json
└── README.md
```

Não serão criadas pastas para rotas, APIs, componentes de framework, serviços remotos ou configuração de ambiente. Novas subdivisões só deverão ser introduzidas se uma story aprovada demonstrar necessidade real.

## 3. Responsabilidade de cada arquivo

| Arquivo | Responsabilidade | Não deve fazer |
| --- | --- | --- |
| `index.html` | Declarar a estrutura semântica da página, as regiões estáveis e o carregamento da aplicação | Conter regras, estado, estilos inline ou manipuladores inline |
| `css/style.css` | Definir layout, responsividade, estados visuais e foco | Conter branding não aprovado ou depender de JavaScript para layout |
| `js/app.js` | Inicializar a aplicação, manter estado e contexto transitório e coordenar os módulos | Duplicar regras do domínio, manipular LocalStorage diretamente ou montar HTML |
| `js/domain.js` | Validar dados, realizar transições de tarefas e calcular gamificação | Acessar DOM, LocalStorage ou APIs de interface |
| `js/storage.js` | Ler, interpretar, validar e gravar o documento persistido | Alterar DOM, decidir mensagens ou executar regras de tarefas |
| `js/ui.js` | Localizar elementos, registrar interações de UI, renderizar e apresentar feedback | Calcular XP, alterar estado diretamente ou acessar LocalStorage |
| `tests/domain.test.js` | Verificar regras puras de tarefas, integridade e gamificação | Depender de DOM ou armazenamento real |
| `tests/storage.test.js` | Verificar serialização, validação e falhas de persistência | Modificar o LocalStorage real do navegador |
| `docs/PRD.md` | Preservar requisitos e critérios aprovados | Receber decisões que alterem o escopo sem nova aprovação |
| `docs/ARCHITECTURE.md` | Registrar as decisões técnicas vigentes | Implementar código de produção |
| `docs/TESTS.md` | Registrar posteriormente cenários, evidências e resultados de QA | Substituir testes automatizados |
| `package.json` | Declarar scripts de qualidade e ferramentas exclusivamente de desenvolvimento | Introduzir dependência de produção não aprovada |
| `README.md` | Explicar preparação, execução por servidor estático e comandos do projeto | Tornar-se fonte concorrente de requisitos |

## 4. Organização do HTML

O `index.html` será um único documento semântico, organizado na seguinte ordem conceitual:

1. `header` com o nome do produto e o resumo de progressão.
2. Região de progressão com saídas separadas para nível atual, XP total e progresso do nível.
3. `main` contendo o fluxo principal.
4. Seção de cadastro com formulário, rótulo, campo, ação de adicionar e área contextual de validação.
5. Seção de tarefas com título, estado vazio e lista semântica.
6. Itens de tarefa com texto, estado e ações aplicáveis.
7. Região persistente para condição de armazenamento.
8. Região de anúncio não bloqueante para sucessos operacionais e subida de nível.

A barra de progresso deverá usar um elemento semântico apropriado ou equivalente acessível e sempre terá texto equivalente, como “30/100 XP para o próximo nível”. XP total, progresso do nível e nível atual não poderão ser apresentados como se fossem o mesmo valor.

O modo de edição apresentará campo editável e ações explícitas de salvar e cancelar. A confirmação de exclusão utilizará, no MVP, o mecanismo nativo do navegador. Não haverá HTML produzido a partir de texto interpretado do usuário.

## 5. Organização do CSS

Haverá um único arquivo `css/style.css`, organizado por blocos:

1. configurações globais e normalização mínima;
2. elementos semânticos;
3. layout principal;
4. resumo de nível e XP;
5. formulário;
6. lista e item de tarefa;
7. modo de edição e ações;
8. estados pendente, concluído, vazio e erro;
9. feedbacks e condição de persistência;
10. foco e acessibilidade;
11. media queries.

A abordagem será mobile-first. Flexbox ou CSS Grid poderão ser usados diretamente conforme a região. Breakpoints serão determinados pelo ponto em que o conteúdo deixar de funcionar, não por modelos específicos de dispositivo.

Regras obrigatórias:

- não usar estilos inline;
- não ocultar funções obrigatórias em telas estreitas;
- permitir quebra de textos longos;
- permitir que ações mudem de linha;
- impedir rolagem horizontal causada pelo layout;
- preservar foco visível;
- não comunicar estado exclusivamente por cor;
- não usar JavaScript para decidir o layout;
- não definir ainda cores, tipografia específica, tema ou branding detalhado.

Não serão adotados BEM, Sass, Tailwind, CSS Modules ou sistema completo de design tokens. Classes usarão nomes funcionais em `kebab-case`.

## 6. Separação de responsabilidades no JavaScript

### 6.1 Grafo de dependências

```text
app.js
├── domain.js
├── storage.js
└── ui.js

storage.js
└── domain.js (validação e estado inicial)

domain.js
└── sem dependências internas

ui.js
└── sem dependências internas
```

Dependências circulares são proibidas.

### 6.2 `app.js`

- mantém a referência ao estado persistente atual;
- mantém contexto transitório, como tarefa em edição e condição da persistência;
- fornece IDs novos ao domínio;
- registra os eventos uma única vez;
- chama operações explícitas do domínio;
- substitui o estado em memória após resultado válido;
- solicita persistência;
- solicita renderização e feedback.

### 6.3 `domain.js`

- cria o estado inicial;
- valida o formato completo do estado;
- normaliza e valida texto;
- cria, edita, exclui, conclui e reabre tarefas;
- protege as invariantes de `completed` e `xpAwarded`;
- calcula nível e progresso;
- informa se houve mudança e subida de nível.

As operações receberão dados e retornarão um resultado simples com estado resultante, indicação de alteração, erro de validação e metadados de XP. Não haverá classes de domínio, reducer genérico ou barramento de eventos.

### 6.4 `storage.js`

- acessa exclusivamente a chave definida para o produto;
- converte entre JSON e o estado;
- chama a validação integral antes de devolver dados;
- captura falhas de acesso, leitura e gravação;
- retorna resultados explícitos sem produzir mensagens na tela.

Para testes, aceitará somente um objeto compatível com `getItem` e `setItem`. Isso não constituirá um framework de injeção de dependências.

### 6.5 `ui.js`

- concentra consultas e alterações do DOM;
- mantém funções pequenas de renderização;
- renderiza a partir de estado e contexto transitório recebidos;
- usa delegação de eventos somente na lista dinâmica;
- usa listeners diretos nos elementos estáveis;
- usa atributos `data-*` para intenção e ID de tarefa;
- apresenta confirmação, erros e feedbacks;
- gerencia foco depois de operações destrutivas.

Não haverá classe de interface, template engine, componente abstrato ou sistema próprio de eventos.

### 6.6 Convenções

- funções e variáveis: `camelCase`;
- constantes: `UPPER_SNAKE_CASE`;
- arquivos, classes CSS e atributos compostos: `kebab-case`;
- IDs HTML: somente para regiões estruturais únicas;
- ações do domínio: verbos explícitos, evitando alternância cega;
- texto do usuário: inserção como texto, nunca como HTML.

## 7. Modelo de dados das tarefas

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | string | Sim | Não vazio, único e estável |
| `text` | string | Sim | Não vazio após remoção de espaços nas extremidades |
| `completed` | boolean | Sim | Indica o estado atual da tarefa |
| `xpAwarded` | boolean | Sim | Indica se a recompensa única já foi concedida |

Não serão adicionados prazo, prioridade, categoria, ordem manual, histórico, autor ou outras propriedades fora do PRD.

### 7.1 Geração de ID

`app.js` solicitará um UUID à API criptográfica nativa do navegador e verificará se o valor já existe na coleção. Em caso de colisão, um novo valor será solicitado antes da criação. `domain.js` somente aceitará a nova tarefa se o ID recebido for válido e único.

O suporte à API escolhida deverá ser confirmado pela matriz de navegadores do QA. Não será criada uma biblioteca de identificação.

### 7.2 Combinações de estado

| `completed` | `xpAwarded` | Significado | Validade |
| --- | --- | --- | --- |
| `false` | `false` | Pendente e nunca recompensada | Válido |
| `true` | `true` | Concluída e recompensada | Válido |
| `false` | `true` | Recompensada e posteriormente reaberta | Válido |
| `true` | `false` | Concluída sem receber a recompensa obrigatória | Inválido |

## 8. Modelo de persistência

O estado persistente será um único documento JSON. O estado em memória é a fonte de verdade da sessão; o documento salvo permite restaurá-lo em uma sessão posterior no mesmo navegador e perfil.

Campos persistentes:

- versão do esquema;
- XP total acumulado;
- coleção completa de tarefas.

Não serão persistidos:

- nível atual;
- progresso do nível;
- tarefa em edição;
- mensagens e feedbacks;
- condição momentânea da persistência;
- referências do DOM.

Nível e progresso são derivados de `totalXp`. O XP total precisa ser persistido separadamente das tarefas porque excluir uma tarefa recompensada não reduz o XP acumulado.

Cada alteração real tentará gravar o documento completo. Para o volume pessoal previsto, essa estratégia é mais simples e menos sujeita a inconsistência que distribuir dados entre várias chaves.

## 9. Estrutura utilizada no LocalStorage

- Chave: `taskQuest.state`.
- Formato: JSON.
- Versão inicial: `schemaVersion` igual a `1`.

Estrutura conceitual:

```json
{
  "schemaVersion": 1,
  "totalXp": 130,
  "tasks": [
    {
      "id": "identificador-unico",
      "text": "Exemplo de tarefa",
      "completed": true,
      "xpAwarded": true
    }
  ]
}
```

O exemplo descreve o contrato de dados e não constitui implementação.

`schemaVersion` será mantida dentro do documento, sem duplicar a versão no nome da chave. Uma versão desconhecida será rejeitada no MVP. Não haverá migração, recuperação parcial ou chave alternativa.

## 10. Mecanismo para registrar se uma tarefa já concedeu XP

Cada tarefa possui o booleano persistente `xpAwarded`.

Regras:

- uma nova tarefa começa com `xpAwarded: false`;
- na primeira conclusão, `completed` e `xpAwarded` passam a verdadeiro na mesma transição;
- o XP é acrescentado nessa mesma operação;
- reabrir altera somente `completed` para falso;
- editar altera somente `text`;
- concluir uma tarefa cujo `xpAwarded` já seja verdadeiro nunca concede XP novamente;
- excluir a tarefa não modifica o XP total.

O mecanismo é idempotente e não depende da aparência da interface. Múltiplos eventos de conclusão usarão o estado mais recente e somente a primeira transição elegível produzirá recompensa.

## 11. Cálculo de XP, nível e progresso

Constantes de domínio:

- XP por primeira conclusão: 10;
- XP por nível: 100;
- nível inicial: 1.

Fórmulas:

- `nível = piso(totalXp / 100) + 1`;
- `progresso = totalXp módulo 100`;
- `percentual da barra = progresso`, pois cada ciclo possui 100 XP.

Casos obrigatórios:

| XP total | Nível | Progresso |
| ---: | ---: | ---: |
| 0 | 1 | 0/100 |
| 90 | 1 | 90/100 |
| 100 | 2 | 0/100 |
| 130 | 2 | 30/100 |
| 190 | 2 | 90/100 |
| 200 | 3 | 0/100 |

Uma subida de nível será detectada comparando o nível derivado antes e depois da conclusão. As mesmas fórmulas valem para múltiplos posteriores de 100.

Validação de integridade:

- `totalXp` deve ser inteiro, não negativo e múltiplo de 10;
- `totalXp` deve ser maior ou igual à quantidade de tarefas com `xpAwarded: true` multiplicada por 10;
- igualdade não é exigida, pois tarefas recompensadas podem ter sido excluídas.

## 12. Fluxo de criação de tarefas

```text
Usuário envia o formulário
→ ui.js fornece o texto a app.js
→ app.js solicita e valida um ID ainda não utilizado
→ domain.js remove espaços externos e valida o texto
→ inválido: estado permanece igual e ui.js mostra erro contextual
→ válido: domain.js cria tarefa pendente e não recompensada
→ app.js atualiza o estado em memória
→ storage.js tenta salvar o documento completo
→ ui.js renderiza a lista, limpa o campo e mostra feedback
```

Se a gravação falhar, a tarefa continuará visível durante a sessão e a região de persistência informará que ela pode desaparecer após sair ou recarregar.

## 13. Fluxo de edição

```text
Usuário escolhe Editar
→ app.js registra o ID transitório em edição
→ ui.js renderiza campo com o texto atual e ações Salvar/Cancelar
→ Salvar: domain.js valida o texto e altera somente text
→ app.js atualiza, tenta persistir, encerra edição e renderiza
→ Cancelar: app.js limpa o ID transitório e renderiza o estado original
```

Regras:

- digitar não altera o estado persistente;
- erro de entrada mantém o modo de edição;
- apenas uma tarefa fica em edição por vez;
- iniciar outra edição cancela visualmente a anterior sem alterar dados;
- tarefas concluídas podem ser editadas;
- `id`, `completed` e `xpAwarded` são preservados;
- uma falha de gravação não reabre o modo de edição, mas produz o aviso de sessão não persistida.

## 14. Fluxo de exclusão

```text
Usuário escolhe Excluir
→ ui.js apresenta confirmação nativa
→ cancelamento: nenhuma alteração
→ confirmação: app.js determina o próximo destino de foco
→ domain.js remove a tarefa sem alterar totalXp
→ app.js atualiza, tenta persistir e solicita renderização
→ ui.js mostra feedback e reposiciona o foco
```

Prioridade do foco após a remoção:

1. ação equivalente da próxima tarefa;
2. ação equivalente da tarefa anterior;
3. campo de criação, se a lista ficar vazia.

## 15. Fluxo de conclusão e reabertura

As intenções serão explícitas e separadas; não haverá função genérica de alternância.

### 15.1 Primeira conclusão

```text
Concluir tarefa pendente e nunca recompensada
→ completed = true
→ xpAwarded = true
→ totalXp += 10
→ comparar nível anterior e posterior
→ persistir e renderizar
→ apresentar conclusão e, se aplicável, subida de nível
```

### 15.2 Reabertura

```text
Reabrir tarefa concluída
→ completed = false
→ preservar xpAwarded
→ preservar totalXp
→ persistir e renderizar
```

### 15.3 Nova conclusão

```text
Concluir tarefa reaberta e já recompensada
→ completed = true
→ preservar xpAwarded
→ preservar totalXp
→ persistir e renderizar
```

Concluir tarefa já concluída ou reabrir tarefa já pendente resulta em nenhuma alteração, nenhuma gravação e nenhum XP. Essa idempotência protege contra cliques ou eventos repetidos.

## 16. Fluxo de inicialização da aplicação

```text
1. app.js é carregado como módulo nativo
2. ui.js localiza e valida as regiões estruturais
3. storage.js tenta acessar e ler taskQuest.state
4. domain.js valida o documento interpretado
5. app.js adota o estado restaurado ou cria estado inicial
6. app.js registra eventos uma única vez
7. ui.js realiza a primeira renderização
8. ui.js apresenta eventual aviso de recuperação ou sessão volátil
```

Estado inicial:

- `schemaVersion: 1`;
- `totalXp: 0`;
- `tasks: []`;
- nível derivado igual a 1;
- progresso derivado igual a 0/100.

Uma chave ausente representa primeiro uso e não gera erro.

## 17. Tratamento de dados ausentes ou inválidos

O documento persistido somente será aceito quando:

- puder ser convertido de JSON;
- possuir versão reconhecida;
- possuir `totalXp` inteiro, não negativo e múltiplo de 10;
- possuir uma lista de tarefas;
- todos os IDs forem textuais, não vazios e únicos;
- todo `text` for válido;
- `completed` e `xpAwarded` forem booleanos;
- nenhuma tarefa estiver concluída sem ter sido recompensada;
- o XP total não for inferior às recompensas representadas.

Qualquer falha invalida o documento inteiro. A aplicação então:

1. cria um estado inicial novo;
2. permanece utilizável;
3. informa que os dados locais não puderam ser recuperados;
4. não tenta recuperar registros parcialmente;
5. não sobrescreve o conteúdo inválido durante a simples inicialização.

A primeira alteração válida poderá substituir o documento inválido se a gravação funcionar. XP válido acompanhado por tarefas inválidas não será preservado isoladamente, pois não existe base segura para reconstruir a consistência.

## 18. Tratamento de falhas no LocalStorage

`storage.js` representará os seguintes resultados:

- sucesso;
- dado ausente;
- dado inválido;
- armazenamento indisponível;
- falha de leitura;
- falha de gravação.

Todo acesso, conversão e gravação será protegido. Mensagens específicas de exceção do navegador não serão usadas como regra de negócio.

Se o LocalStorage estiver indisponível desde o início:

- a aplicação inicia com estado seguro;
- tarefas funcionam em memória durante a sessão;
- a interface comunica que os dados não serão preservados;
- tentativas posteriores continuam protegidas;
- uma gravação futura bem-sucedida salva o estado completo atual.

Se uma gravação falhar depois de o estado em memória mudar:

- não haverá rollback automático;
- a interface continuará representando o estado da sessão;
- uma mensagem separada informará o risco de perda ao recarregar;
- uma gravação posterior bem-sucedida persistirá todas as alterações atuais.

Não haverá cookies, IndexedDB, download, backend ou outro fallback de armazenamento.

## 19. Responsividade

A estratégia será mobile-first e inteiramente baseada em CSS.

Requisitos arquiteturais:

- contêiner de conteúdo fluido com limite confortável no desktop;
- formulário capaz de reorganizar campo e ação;
- texto de tarefa com quebra segura;
- ações capazes de mudar de linha;
- lista e resumo de progresso sem larguras fixas impeditivas;
- nenhuma funcionalidade escondida por breakpoint;
- ausência de rolagem horizontal causada pelo layout;
- barra de progresso adaptável ao espaço disponível;
- sem detecção de dispositivo ou largura pelo JavaScript.

Os breakpoints exatos serão escolhidos durante a implementação pelo comportamento do conteúdo e registrados nos testes manuais, sem vínculo com marcas ou aparelhos específicos.

## 20. Acessibilidade

A acessibilidade básica do PRD será atendida por:

- estrutura HTML semântica;
- lista semanticamente reconhecível;
- formulário com rótulo associado;
- botões nativos para ações;
- operação integral do fluxo principal por teclado;
- foco visível;
- nomes acessíveis claros;
- erro de entrada associado ao campo correspondente;
- estados que não dependam somente de cor;
- barra de progresso com texto equivalente;
- região própria para falha de persistência;
- região de anúncio não bloqueante para operação e nível;
- restauração previsível de foco após exclusão;
- texto ampliável e quebrável sem perda de função;
- confirmação nativa de exclusão no MVP.

O texto das tarefas será inserido como conteúdo textual, nunca como HTML. Testes aprofundados com leitores de tela e compatibilidade assistiva serão responsabilidade do QA e não representam promessa de conformidade além do requisito básico aprovado.

## 21. Decisões arquiteturais e justificativas

| ID | Decisão | Justificativa | Alternativa rejeitada |
| --- | --- | --- | --- |
| DA-01 | Aplicação estática de página única | Menor complexidade e aderência ao PRD | Roteamento com múltiplas páginas |
| DA-02 | HTML, CSS e JavaScript nativos | Stack aprovada | Framework frontend |
| DA-03 | Quatro módulos ES | Equilíbrio entre organização e simplicidade | Arquivo único ou camadas excessivas |
| DA-04 | Servidor HTTP estático no desenvolvimento | Suporte previsível a módulos nativos | Execução por `file://` com limitações |
| DA-05 | Estado coordenado por `app.js` | Uma fonte de verdade na sessão | Estado disperso no DOM |
| DA-06 | Domínio puro | Testabilidade e proteção das regras | Regras dentro dos eventos de UI |
| DA-07 | DOM concentrado em `ui.js` | Evita manipulação espalhada | Sistema de componentes ou múltiplas views |
| DA-08 | Delegação somente na lista | Adequada a itens dinâmicos sem abstração geral | Um listener por item |
| DA-09 | Documento único no LocalStorage | Evita divergência entre várias chaves | Uma chave por entidade ou valor |
| DA-10 | `totalXp` persistido | Exclusões não retiram XP | Recalcular somente pelas tarefas existentes |
| DA-11 | Nível e progresso derivados | Elimina fontes divergentes | Persistir os três valores |
| DA-12 | Booleano `xpAwarded` por tarefa | Garante recompensa única após reabertura | Inferir recompensa apenas por `completed` |
| DA-13 | Chave estável e versão interna | Reconhece formato com baixo custo | Versão duplicada na chave |
| DA-14 | Validação integral | Protege consistência entre tarefas e XP | Recuperação parcial complexa |
| DA-15 | Operações explícitas e idempotentes | Protege contra eventos repetidos | Alternância genérica de estado |
| DA-16 | Sessão volátil quando necessário | Mantém utilidade sem esconder falha | Bloquear toda a aplicação ou criar fallback |
| DA-17 | Confirmação nativa | Simples, acessível por teclado e suficiente | Modal personalizado |
| DA-18 | CSS nativo mobile-first | Responsividade sem dependências | Framework CSS |
| DA-19 | `node:test` para regras críticas | Automação sem framework de teste | Ferramenta externa de testes |
| DA-20 | UI validada principalmente de forma manual | Proporcional ao MVP | jsdom ou suíte E2E inicial |

### 21.1 Padrões críticos

- nenhum acesso ao DOM fora de `ui.js`;
- nenhum acesso ao LocalStorage fora de `storage.js`;
- nenhuma regra de XP fora de `domain.js`;
- nenhuma persistência de valores derivados;
- nenhuma alteração de `xpAwarded` durante edição ou reabertura;
- nenhuma inserção de texto do usuário como HTML;
- nenhuma exceção de armazenamento ignorada silenciosamente;
- nenhuma nova camada ou funcionalidade sem requisito aprovado.

### 21.2 Execução e qualidade

A aplicação será servida por HTTP estático durante o desenvolvimento. Isso não representa backend: o servidor apenas entrega arquivos e não processa regras ou dados.

O projeto deverá configurar, em story própria antes da implementação funcional, os comandos exigidos por `AGENTS.md`:

- `npm run lint`;
- `npm run typecheck`, analisando JavaScript sem converter o produto para TypeScript;
- `npm test`, usando `node:test`;
- `npm run build`, entendido como validação dos arquivos estáticos, sem bundling.

Ferramentas eventualmente necessárias para lint e análise de tipos serão dependências de desenvolvimento, com versões fixadas no lockfile. Não farão parte da execução do produto.

## 22. Riscos técnicos

| ID | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| RT-01 | Limpeza, modo privado ou troca de navegador remover dados | Alta | Alto | Comunicar explicitamente a natureza local |
| RT-02 | LocalStorage bloqueado ou sem capacidade | Baixa | Alto | Sessão volátil e aviso persistente |
| RT-03 | Documento parcialmente corrompido | Média | Alto | Validação integral e estado seguro |
| RT-04 | XP duplicado por eventos repetidos | Média | Alto | Operações idempotentes e `xpAwarded` persistente |
| RT-05 | Divergência entre XP, nível e progresso | Média | Alto | `totalXp` como fonte e valores derivados |
| RT-06 | Colisão ou incompatibilidade na geração de IDs | Baixa | Médio | UUID, verificação de unicidade e teste de navegador |
| RT-07 | Falha por abrir módulos diretamente por `file://` | Média | Médio | Documentar servidor HTTP estático |
| RT-08 | Última gravação vencer em duas abas concorrentes | Média | Médio | Documentar limitação; não sincronizar abas no MVP |
| RT-09 | Crescimento da coleção degradar gravação e renderização | Baixa | Médio | Testar volume e capturar falha de capacidade |
| RT-10 | Texto longo romper o layout | Média | Médio | Quebra segura e teste responsivo |
| RT-11 | Feedbacks concorrentes esconderem erro de persistência | Média | Médio | Regiões e prioridades distintas |
| RT-12 | Foco ser perdido após exclusão | Média | Médio | Definir destino antes da remoção |
| RT-13 | `ui.js` crescer além do escopo | Baixa | Médio | Funções pequenas; sem classes ou sistema de componentes |
| RT-14 | Ferramentas de qualidade ampliarem a stack | Média | Baixo | Dependências apenas de desenvolvimento e sem bundler |

Limitações aceitas:

- sem sincronização entre abas ou dispositivos;
- sem recuperação parcial de dados;
- sem armazenamento alternativo;
- sem limite de texto inventado pela arquitetura;
- sem otimização para volumes não previstos no uso pessoal;
- sem telemetria ou monitoramento remoto.

## 23. Pontos para validação posterior pelo QA

### 23.1 Domínio e gamificação automatizados

- cadastro com texto válido e rejeição de texto vazio ou composto por espaços;
- edição preservando ID, estado e recompensa;
- exclusão sem redução de XP;
- primeira conclusão concedendo exatamente 10 XP;
- conclusão repetida sem XP adicional;
- reabertura preservando XP;
- operações idempotentes diante de eventos repetidos;
- combinações válidas e inválidas de `completed` e `xpAwarded`;
- totais 0, 90, 100, 130, 190, 200 e múltiplos posteriores;
- detecção correta de subida de nível;
- total de XP incompatível com tarefas recompensadas.

### 23.2 Persistência automatizada

- chave ausente;
- ciclo de salvar e carregar;
- JSON ilegível;
- versão desconhecida;
- campos ausentes ou tipos incorretos;
- tarefa inválida em uma lista parcialmente válida;
- IDs vazios ou duplicados;
- XP negativo, fracionário ou fora de múltiplos de 10;
- falha ao acessar armazenamento;
- falha de leitura;
- falha de gravação;
- armazenamento indisponível desde a inicialização;
- gravação bem-sucedida depois de uma falha anterior.

### 23.3 Interface e fluxos manuais

- todos os 18 critérios de aceite do PRD;
- página única e ausência de recarregamento obrigatório;
- criação, edição, cancelamento, exclusão, conclusão e reabertura;
- edição de tarefa concluída e recompensada;
- confirmação e cancelamento de exclusão;
- múltiplos cliques e eventos rápidos;
- feedback mínimo depois de cada operação;
- coexistência de feedback operacional e erro de persistência;
- estado vazio;
- modo de sessão volátil;
- foco após criação, edição, cancelamento e exclusão;
- layout em cenários de desktop e mobile;
- texto longo sem rolagem horizontal;
- fluxo completo somente por teclado;
- foco visível e nomes acessíveis;
- erro associado ao campo;
- barra de progresso com texto equivalente;
- estados compreensíveis sem depender apenas de cor;
- aviso de nível não bloqueante;
- execução por servidor HTTP estático nos navegadores definidos;
- suporte à geração de UUID nos navegadores definidos;
- ausência de requisições externas.

### 23.4 Quality gates

Antes de considerar uma story concluída:

- `npm run lint` deve passar;
- `npm run typecheck` deve passar;
- `npm test` deve passar;
- `npm run build` deve passar;
- checklist e lista de arquivos da story devem estar atualizados.

Testes automatizados de DOM, regressão visual, leitor de tela aprofundado e E2E ficam fora da configuração inicial. O QA poderá recomendar sua inclusão somente diante de risco comprovado.

## Matriz de rastreabilidade arquitetural

| Requisito do PRD | Solução arquitetural |
| --- | --- |
| RF-01, RF-17 a RF-20 | `storage.js`, documento único, validação e sessão volátil |
| RF-02 a RF-08 | Fluxos de criação, edição e exclusão no domínio e coordenação |
| RF-09 a RF-16 | `xpAwarded`, operações idempotentes e cálculos derivados |
| RF-21 a RF-24 | Validação contextual, renderização e página única |
| RNF-01 a RNF-04 | Stack web nativa, sem backend ou integração externa |
| RNF-05 a RNF-07 | CSS mobile-first e servidor estático |
| RNF-08 a RNF-14 | Renderização determinística e regiões de feedback |
| RNF-15 a RNF-21 | HTML semântico, teclado, foco e comunicação acessível |
| RNF-22 a RNF-25 | Validação integral, tratamento de falhas e armazenamento local explícito |
| RN-01 a RN-15 | `domain.js`, contrato persistido e invariantes documentadas |

## Itens não aplicáveis

| Área | Motivo |
| --- | --- |
| Backend e API | Excluídos pelo PRD |
| Banco de dados remoto | LocalStorage é obrigatório |
| Autenticação e autorização | Uso individual e local |
| Roteamento | Aplicação de página única |
| Variáveis de ambiente | Não existem segredos ou endpoints |
| Integrações de terceiros | Excluídas pelo PRD |
| Infraestrutura de escala | Aplicação estática e acadêmica |
| Migração de dados | Não necessária para o primeiro esquema |
| Backup e recuperação em nuvem | Fora do MVP |

## Handoff para desenvolvimento

Esta arquitetura está pronta para ser decomposta em stories por `@sm` ou `@po`. Nenhum código deve ser implementado antes de existirem stories aprovadas, com critérios de aceite e lista de arquivos. A ordem sugerida para o backlog é:

1. preparação dos scripts de qualidade e execução estática;
2. domínio e testes de regras;
3. persistência e testes de falha;
4. estrutura semântica e renderização;
5. fluxos integrados e feedbacks;
6. responsividade, acessibilidade e validação final.

Esta ordem é apenas uma recomendação arquitetural. A criação e aprovação das stories pertencem aos agentes autorizados pelo processo do projeto.
