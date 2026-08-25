# Backend AIDAM — Node.js + Express + TypeScript + MySQL

API REST independente do frontend, preparada para correr no **cPanel → Setup Node.js App**.
Não usa Supabase nem qualquer integração do Lovable.

```
backend/
├── app.js                # ficheiro de arranque do cPanel (carrega dist/server.js)
├── src/
│   ├── app.ts            # Express, CORS, helmet, tratamento de erros
│   ├── server.ts         # arranque + ligação MySQL
│   ├── lib/              # env, ligação MySQL (mysql2), Nodemailer
│   ├── middleware/auth.ts# JWT + middleware exigirAdmin
│   └── routes/           # noticias, contacto, admin
├── scripts/criar-admin.ts
├── sql/schema.sql        # CREATE TABLE: noticias, mensagens_contacto, admins
└── .env.example
```

## Instalação local

```bash
cd backend
cp .env.example .env      # preencher as credenciais
npm install
npm run dev               # http://localhost:3000/api/saude
```

## Base de dados

1. Criar a base de dados e o utilizador MySQL no cPanel.
2. Importar `sql/schema.sql` no phpMyAdmin.
3. Criar o primeiro administrador:
   ```bash
   npx tsx scripts/criar-admin.ts "Administrador" admin@aidam.co.mz "PalavraPasseForte"
   ```

## Publicação no cPanel

1. Enviar a pasta `backend/` para o servidor (ex.: `/home/utilizador/aidam-api`).
2. **Setup Node.js App** → Application root: `aidam-api`; Application startup file: `app.js`;
   Application URL: `aidam.co.mz/api` (ou um subdomínio `api.aidam.co.mz`).
3. Adicionar as variáveis de ambiente do `.env.example` no painel da aplicação.
4. **Run NPM Install**, depois `npm run build` (gera `dist/`) e **Restart**.
5. Confirmar em `https://api.aidam.co.mz/api/saude`.

> O `app.js` só carrega `dist/server.js`; é obrigatório correr `npm run build` após cada actualização de código.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DB_HOST` `DB_USER` `DB_PASS` `DB_NAME` `DB_PORT` | Ligação MySQL |
| `JWT_SECRET` `JWT_EXPIRA` | Assinatura e validade do token de admin |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` | Envio de email (Nodemailer) |
| `EMAIL_DESTINO` `EMAIL_REMETENTE` | Destinatário e remetente das mensagens de contacto |
| `CORS_ORIGEM` | Domínios autorizados, separados por vírgula |
| `PORT` | Definido automaticamente pelo cPanel |

## Endpoints

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/api/saude` | público |
| GET | `/api/noticias` | público (`?todas=1` devolve rascunhos para o painel) |
| GET | `/api/noticias/:id` | público (aceita id ou slug) |
| POST | `/api/noticias` | admin |
| PUT | `/api/noticias/:id` | admin |
| DELETE | `/api/noticias/:id` | admin |
| POST | `/api/contacto` | público (grava + envia email) |
| GET | `/api/contacto` | admin |
| PUT | `/api/contacto/:id` | admin (marcar como lida) |
| DELETE | `/api/contacto/:id` | admin |
| POST | `/api/admin/login` | público → `{ token, admin }` |
| GET | `/api/admin/me` | admin |
| POST | `/api/admin/password` | admin |

As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

### Exemplos

```bash
curl -X POST https://api.aidam.co.mz/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aidam.co.mz","password":"PalavraPasseForte"}'

curl -X POST https://api.aidam.co.mz/api/noticias \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"titulo":"Título","slug":"titulo","data":"2026-08-25","categoria":"Mercado","resumo":"Resumo da notícia.","corpo":"Texto completo."}'
```

## Segurança

- Palavras-passe com bcrypt (12 rondas); tokens JWT com validade configurável.
- Todas as consultas usam declarações preparadas do `mysql2` (sem concatenação de SQL).
- Validação de entrada com Zod em todas as rotas de escrita.
- `helmet`, CORS restrito por domínio, limite de tentativas no login (10/15min) e no formulário de contacto (5/15min), e honeypot anti-spam.
- Servir sempre sobre HTTPS.

## Ligar o frontend

No frontend, definir `VITE_API_URL=https://api.aidam.co.mz/api` e reconstruir o site.

## Endpoints adicionais

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/health` (ou `/api/saude`) | Público | Estado do serviço: processo, MySQL (com latência), SMTP, uptime e memória. Devolve 503 se a base de dados falhar. |
| GET/POST/PUT/DELETE | `/api/conteudos/associados` | Leitura pública / escrita protegida | Portfólio de associados. |
| GET/POST/PUT/DELETE | `/api/conteudos/orgaos` | Leitura pública / escrita protegida | Membros dos órgãos sociais. |
| GET/POST/PUT/DELETE | `/api/conteudos/institucional` | Leitura pública / escrita protegida | Blocos de texto institucionais. |
| GET | `/api/definicoes/publicas` | Público | Definições visíveis no website (contactos, redes sociais…). |
| GET/PUT | `/api/definicoes` | Protegido | Todas as definições, incluindo SMTP (palavra-passe mascarada). |
| GET | `/api/definicoes/smtp/verificar` | Protegido | Testa a ligação ao servidor SMTP. |
| POST | `/api/definicoes/smtp/teste` | Protegido | Envia um email de teste. |
| POST/GET/DELETE | `/api/uploads` | Protegido | Carregamento de imagens/PDF (campo `ficheiro`, máx. 5 MB) e biblioteca. |
| GET/POST/PUT/DELETE | `/api/admin/utilizadores` | Protegido | Gestão de contas de administrador. |
| GET | `/api/admin/estatisticas` | Protegido | Contadores usados no painel. |

Os ficheiros carregados são gravados em `backend/uploads/` e servidos em `/uploads/<ficheiro>`.
Defina `URL_PUBLICA` no `.env` para que os endereços gerados apontem para o domínio correcto.

Verificação rápida após o deploy:

```bash
curl -s https://api.aidam.co.mz/api/health | jq
```
