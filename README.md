# Task Quest

MVP acadêmico de gerenciamento de tarefas com gamificação, executado integralmente no navegador. Cada primeira conclusão concede 10 XP, e um novo nível é alcançado a cada 100 XP.

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

Os cenários integrados e os 18 critérios de aceite estão documentados em `docs/TESTS.md`.
