# API do CMS da AIDAM (MySQL)

Backend mínimo em PHP 8 + MySQL para alimentar o painel de administração do website.

## Instalação em aidam.co.mz

1. Criar a base de dados e executar `schema.sql`.
2. Copiar a pasta `api/` para a raiz pública (fica em `https://aidam.co.mz/api`).
3. Copiar `api/config.example.php` para `api/config.php` e preencher as credenciais.
4. Criar o primeiro utilizador:
   ```sql
   INSERT INTO utilizadores (id, nome, email, palavra_passe)
   VALUES (UUID(), 'Administrador', 'admin@aidam.co.mz', '<hash>');
   ```
   O `<hash>` é gerado com `php -r "echo password_hash('a-sua-password', PASSWORD_DEFAULT);"`.
5. Garantir que o Apache reencaminha tudo para `index.php` (`api/.htaccess`).
6. No website, definir `VITE_API_URL=https://aidam.co.mz/api` e reconstruir.

Sem `VITE_API_URL`, o painel funciona em modo de demonstração (dados no navegador).

## Endpoints

| Método | Caminho | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/login` | — | `{ email, palavra_passe }` → `{ token, utilizador }` |
| GET | `/auth/me` | Bearer | Utilizador da sessão |
| POST | `/auth/logout` | Bearer | Termina a sessão |
| GET | `/{recurso}` | pública (só publicados) / Bearer (tudo) | Lista |
| POST | `/{recurso}` | Bearer (excepto `mensagens`) | Cria |
| PUT | `/{recurso}/{id}` | Bearer | Actualiza |
| DELETE | `/{recurso}/{id}` | Bearer | Elimina |

Recursos: `noticias`, `associados`, `orgaos`, `institucional`, `mensagens`.

O formulário público de contacto faz `POST /mensagens` sem autenticação; a leitura das mensagens exige sessão.

## Segurança

- Palavras-passe guardadas com `password_hash()`; sessões por token com validade de 12 horas.
- Todas as consultas usam declarações preparadas (sem concatenação de valores).
- CORS restrito ao domínio definido em `origem_permitida`.
- Servir sempre a API sobre HTTPS.
