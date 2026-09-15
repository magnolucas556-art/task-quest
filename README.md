# Task Quest

Aplicação acadêmica de gerenciamento de tarefas com gamificação, executada integralmente no navegador. A V2 combina prioridades, prazos, calendário mensal, métricas, gráficos acessíveis e temas claro/escuro. Cada primeira conclusão concede 10 XP, e um novo nível é alcançado a cada 100 XP.

## Recursos da V2

- criação, edição, conclusão, reabertura e exclusão de tarefas;
- prioridade baixa, média ou alta e prazo opcional;
- calendário mensal com navegação entre meses;
- métricas de conclusão, pendências e atrasos;
- gráficos HTML/CSS com valores textuais equivalentes;
- modo claro/escuro persistente e movimento reduzido;
- migração automática de dados válidos da V1.

## Execução local

Os módulos ES precisam ser servidos por HTTP. Na raiz do projeto, inicie qualquer servidor estático local e abra o endereço apresentado por ele no navegador.

Sirva a raiz do repositório com a ferramenta de servidor estático disponível no seu ambiente e abra o endereço local informado por ela. Abrir `index.html` diretamente pelo sistema de arquivos não é recomendado porque o navegador pode bloquear os módulos ES.

Os dados ficam somente no LocalStorage do navegador usado. Não há conta, sincronização, backup remoto ou transmissão para serviços externos.

## Validação

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run validate:port-denylist
```

Os cenários da V1 estão documentados em `docs/TESTS.md`. A matriz dos 14 critérios da V2 está em `docs/TESTS-V2.md`.

## Deploy

O projeto não possui backend, bundler ou dependências de produção. O deploy continua sendo a publicação estática da raiz do repositório em um serviço que sirva `index.html`, `css/` e `js/` por HTTPS.
