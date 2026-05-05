# Deploy da API na VPS

Este diretório contém a base para rodar a API .NET com PostgreSQL via Docker Compose.

Domínio sugerido da API:

```txt
api.stratech.online
```

No DNS do domínio, crie um registro `A`:

```txt
api -> IP_DA_VPS
```

Na VPS, copie `.env.example` para `.env` e preencha os segredos reais.
