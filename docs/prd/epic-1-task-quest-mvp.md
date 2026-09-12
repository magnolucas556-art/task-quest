# Epic 1 — MVP Task Quest: gerenciamento de tarefas gamificado

| Campo | Valor |
| --- | --- |
| Epic | 1 |
| Versão | 1.0 |
| Data | 11/09/2026 |
| Status | Aprovado para detalhamento das stories |
| Fonte de produto | `docs/PRD.md` |
| Fonte técnica | `docs/ARCHITECTURE.md` |

## Objetivo

Entregar o MVP completo do Task Quest como aplicação web estática, permitindo gerenciar tarefas, conquistar XP uma única vez por tarefa, acompanhar nível e progresso e preservar os dados no navegador, com interface responsiva e acessibilidade básica.

## Contexto do produto

### Estado atual

O projeto possui PRD aprovado e arquitetura frontend consolidada. Os arquivos de implementação existem como esqueleto, mas ainda não contêm funcionalidade do produto.

### Stack aprovada

- HTML5;
- CSS3;
- JavaScript puro;
- LocalStorage;
- módulos ES nativos;
- `node:test` para testes automatizados das regras e da persistência.

### Restrições

- Não utilizar backend.
- Não utilizar banco de dados remoto.
- Não utilizar autenticação.
- Não utilizar APIs externas.
- Não tornar obrigatório nenhum framework JavaScript.
- Não utilizar bundler ou dependência de produção.
- Não implementar funcionalidades fora do PRD.

### Pontos de integração

- `domain.js` concentra regras e transições de estado.
- `storage.js` concentra a persistência local.
- `app.js` coordena estado, persistência e interface.
- `ui.js` concentra manipulação e renderização do DOM.
- `index.html` e `css/style.css` entregam a experiência de página única.

## Resultado esperado

Ao final do épico, o usuário poderá executar todos os fluxos obrigatórios do PRD em desktop e mobile. As regras de XP, nível e persistência estarão verificadas automaticamente, e os 18 critérios de aceite do produto estarão cobertos por validação automatizada ou manual documentada.

## Sequência das stories

```text
Story 1.1 — Fundação e domínio testável
                  ↓
Story 1.2 — Persistência, inicialização e coordenação
                  ↓
Story 1.3 — Interface responsiva e integração final
```

## Story 1.1 — Fundação e domínio testável

### Objetivo

Preparar os comandos de qualidade e implementar o modelo de estado e as regras puras de tarefas e gamificação, criando uma base verificável via CLI antes da integração visual.

### Escopo

- Configurar os scripts `lint`, `typecheck`, `test` e `build` previstos pela governança do projeto.
- Definir os modelos `AppState` e `Task` conforme a arquitetura.
- Implementar estado inicial e validação do domínio.
- Implementar criação, edição, exclusão, conclusão e reabertura.
- Implementar controle persistível de `xpAwarded`.
- Implementar cálculos de XP, nível e progresso.
- Implementar geração e validação de IDs únicos.
- Tornar conclusão e reabertura idempotentes.
- Criar testes automatizados do domínio.

### Cobertura de requisitos

- Regras de negócio: RN-01 a RN-14.
- Requisitos funcionais: RF-02, RF-04 a RF-13.
- Critérios do PRD: CA-03 a CA-12, na parcela referente ao domínio.
- Arquitetura: seções 6, 7, 10 e 11.

### Critérios de conclusão em nível de épico

1. As regras do domínio são executáveis sem DOM e sem LocalStorage.
2. Primeira conclusão concede exatamente 10 XP.
3. Reabertura, edição, exclusão e conclusão repetida não concedem XP adicional.
4. Os limites 90→100 e 190→200 produzem nível e progresso corretos.
5. Operações repetidas são idempotentes.
6. Texto inválido e estados impossíveis são rejeitados.
7. Os testes do domínio passam por `npm test`.
8. Os quatro comandos de qualidade estão configurados e executáveis.

### Dependências

Nenhuma story anterior.

### Atribuição dinâmica

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - architecture_review
  - code_review
  - pattern_validation
```

### Quality gates previstos

- Pre-Commit: regras de negócio, idempotência, integridade e ausência de dependência do navegador no domínio.
- Pre-PR: compatibilidade com a arquitetura e aprovação dos comandos de qualidade.
- Pre-Deployment: não aplicável.

### Encerramento administrativo

- Story 1.1 concluída com gate de QA `PASS`; status `Done` preservado. [closure-key: 1.1:digest:working-tree:sha256:fbb5595ca7470de3f6b1b8fa61321ded53fffdd9ee21837deb886051fa27d00a]

## Story 1.2 — Persistência, inicialização e coordenação

### Objetivo

Implementar o armazenamento local resiliente e preparar o fluxo central da aplicação, garantindo restauração segura, funcionamento em memória e contratos claros para a futura interface.

### Escopo

- Implementar a chave `taskQuest.state`.
- Implementar o documento com `schemaVersion`, `totalXp` e `tasks`.
- Implementar serialização e validação integral.
- Tratar chave ausente, JSON inválido, versão desconhecida e inconsistências.
- Implementar estado inicial seguro.
- Tratar falhas de acesso, leitura e gravação.
- Implementar funcionamento volátil quando o LocalStorage estiver indisponível.
- Preparar em `app.js` a coordenação entre domínio, persistência e contrato da interface.
- Separar estado persistente de estado transitório.
- Criar testes automatizados do armazenamento.

### Cobertura de requisitos

- Regra de negócio: RN-15.
- Requisitos funcionais: RF-01, RF-17 a RF-20.
- Requisitos não funcionais: RNF-22 a RNF-25.
- Critérios do PRD: CA-01, CA-13 a CA-15, na parcela referente a estado e persistência.
- Arquitetura: seções 8, 9, 16, 17 e 18.

### Critérios de conclusão em nível de épico

1. Estado válido completa o ciclo de gravação e restauração.
2. Chave ausente produz estado inicial sem erro.
3. Qualquer documento inválido é rejeitado integralmente.
4. XP válido acompanhado por tarefas inválidas não é recuperado isoladamente.
5. LocalStorage indisponível não impede o uso da sessão em memória.
6. Falhas de persistência são representadas por resultado explícito.
7. Nova gravação bem-sucedida persiste o estado completo atual.
8. Os testes de persistência passam sem usar o armazenamento real do navegador.

### Dependências

- Story 1.1 concluída.

### Atribuição dinâmica

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - architecture_review
  - code_review
  - pattern_validation
```

### Quality gates previstos

- Pre-Commit: validação do contrato, casos de corrupção, captura de falhas e ausência de fallback não aprovado.
- Pre-PR: separação entre domínio, persistência e coordenação; ausência de dependências circulares.
- Pre-Deployment: não aplicável.

### Encerramento administrativo

- Story 1.2 concluída com gate de QA `PASS`; status `Done` preservado. [closure-key: 1.2:digest:working-tree:sha256:c8a37d7bfdea5ef997f8471924f5908a48ff2ace5407e8fcf3261bf26d5016a8]

## Story 1.3 — Interface responsiva e integração final

### Objetivo

Construir a página única responsiva e acessível, integrar todos os fluxos com domínio e persistência e entregar o MVP verificável contra o PRD.

### Escopo

- Criar a estrutura HTML semântica.
- Criar o CSS mobile-first.
- Implementar renderização e eventos em `ui.js`.
- Integrar cadastro e estado vazio.
- Integrar edição com salvar e cancelar.
- Integrar exclusão com confirmação nativa.
- Integrar conclusão e reabertura explícitas.
- Exibir nível, XP total e barra com texto de progresso.
- Implementar feedbacks operacionais.
- Implementar aviso não bloqueante de subida de nível.
- Exibir erros de entrada e persistência em regiões distintas.
- Implementar delegação de eventos na lista.
- Gerenciar foco após operações.
- Validar responsividade e acessibilidade básica.
- Executar e documentar os 18 critérios de aceite do PRD.

### Cobertura de requisitos

- Requisitos funcionais: RF-03, RF-14 a RF-16, RF-21 a RF-24, além da integração visual dos demais RFs.
- Requisitos não funcionais: RNF-05 a RNF-21.
- Critérios do PRD: CA-01 a CA-18, em validação integrada.
- Arquitetura: seções 4, 5, 12 a 15, 19 e 20.

### Critérios de conclusão em nível de épico

1. Todos os fluxos obrigatórios funcionam sem recarregamento da página.
2. XP total, nível e progresso atual são apresentados separadamente.
3. Estado vazio, entrada inválida e falha de persistência possuem mensagens adequadas.
4. A aplicação funciona em desktop e mobile sem rolagem horizontal causada pelo layout.
5. O fluxo principal pode ser executado somente por teclado.
6. Estados e feedbacks não dependem exclusivamente de cor.
7. Textos fornecidos pelo usuário não são interpretados como HTML.
8. Os 18 critérios de aceite são executados e documentados.

### Dependências

- Story 1.1 concluída.
- Story 1.2 concluída.

### Atribuição dinâmica

```yaml
executor: "@ux-design-expert"
quality_gate: "@dev"
quality_gate_tools:
  - accessibility_check
  - design_review
  - component_validation
```

### Quality gates previstos

- Pre-Commit: HTML semântico, teclado, foco, tratamento seguro de texto e responsividade.
- Pre-PR: integração completa, regressão das regras e execução dos critérios do PRD.
- Pre-Deployment: não aplicável ao épico acadêmico local.

## Compatibilidade

- A aplicação continuará integralmente estática.
- Não haverá API, banco remoto ou autenticação.
- Os módulos manterão o grafo de dependências definido na arquitetura.
- Não haverá dependência de produção.
- A aplicação será executada por servidor HTTP estático durante o desenvolvimento.
- Os dados permanecerão restritos ao navegador e perfil atuais.
- Arquivos existentes somente serão alterados pela story que os declarar em sua lista de arquivos.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Regras de XP incorretas contaminarem a UI | Concluir e revisar o domínio antes da integração visual |
| Persistência inconsistente | Utilizar documento único, validação integral e testes de falha |
| Story 1.3 crescer além do MVP | Limitar estritamente aos 18 critérios do PRD |
| Eventos repetidos concederem XP | Operações explícitas, idempotentes e testadas |
| Interface esconder erro de persistência | Utilizar região persistente distinta de feedback operacional |
| Layout falhar em telas estreitas | Abordagem mobile-first e checklist manual |
| Acessibilidade ser tratada tardiamente | Incluir critérios de teclado, foco e semântica na Story 1.3 |
| Ferramentas de desenvolvimento ampliarem a stack | Manter dependências apenas de desenvolvimento e sem bundler |

## Estratégia de rollback

Como não há banco remoto, migrações ou implantação de produção, o rollback será realizado por unidade de story e pelos arquivos declarados em sua File List. Dados persistidos pelo primeiro esquema não deverão ser alterados por formatos incompatíveis sem revisão arquitetural.

Nenhuma operação remota, exclusão de dados ou rollback será executado pelo Product Manager.

## Estratégia de qualidade

- Toda story deverá possuir critérios de aceite detalhados antes da implementação.
- Toda story deverá manter checklist e File List atualizados.
- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` deverão passar.
- Story 1.1 valida a lógica antes da UI.
- Story 1.2 valida a persistência sem LocalStorage real.
- Story 1.3 executa a validação integrada e manual.
- O executor nunca poderá ser o mesmo agente do quality gate.
- CodeRabbit não está explicitamente habilitado no `core-config.yaml`; enquanto permanecer assim, a revisão será conduzida pelos quality gates definidos e pelo processo manual do projeto.

## Definition of Done do épico

- [ ] As três stories estão concluídas e aprovadas.
- [ ] Os 18 critérios de aceite do PRD foram atendidos.
- [ ] As regras de XP e nível foram verificadas automaticamente.
- [ ] Persistência válida sobrevive ao recarregamento.
- [ ] Falhas de armazenamento não interrompem a sessão.
- [ ] A interface foi validada em cenários de desktop e mobile.
- [ ] O fluxo principal foi validado por teclado.
- [ ] Não existem funcionalidades fora do PRD.
- [ ] Não existem dependências de produção, backend ou integrações externas.
- [ ] Todos os quality gates do projeto passam.
- [ ] Documentação, checklists e listas de arquivos estão atualizados.

## Handoff para o Scrum Master

Criar as stories detalhadas em `docs/stories/`, começando obrigatoriamente pela Story 1.1. Cada story deve ser autocontida, citar seções específicas do PRD e da arquitetura, preservar a sequência definida neste épico e incluir os respectivos executor, quality gate e ferramentas de validação.

Não criar a Story 1.2 antes de a Story 1.1 estar concluída, salvo override explícito do usuário. Não criar a Story 1.3 antes de a Story 1.2 estar concluída, salvo override explícito do usuário.
