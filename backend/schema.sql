-- Base de dados do CMS da AIDAM (MySQL 5.7+ / MariaDB 10.3+)
-- Executar uma única vez na hospedagem aidam.co.mz.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS utilizadores (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  palavra_passe VARCHAR(255) NOT NULL, -- password_hash()
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessoes (
  token         CHAR(64)  NOT NULL PRIMARY KEY,
  utilizador_id CHAR(36)  NOT NULL,
  expira_em     DATETIME  NOT NULL,
  CONSTRAINT fk_sessoes_utilizador FOREIGN KEY (utilizador_id)
    REFERENCES utilizadores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS noticias (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  slug       VARCHAR(200) NOT NULL UNIQUE,
  titulo     VARCHAR(255) NOT NULL,
  data       DATE         NOT NULL,
  categoria  VARCHAR(40)  NOT NULL DEFAULT 'Associação',
  resumo     TEXT         NOT NULL,
  imagem     VARCHAR(500) NOT NULL DEFAULT '',
  imagemAlt  VARCHAR(255) NOT NULL DEFAULT '',
  corpo      LONGTEXT     NOT NULL,
  publicada  TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX idx_noticias_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS associados (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  nome       VARCHAR(180) NOT NULL,
  marcas     VARCHAR(400) NOT NULL DEFAULT '',
  categorias VARCHAR(200) NOT NULL DEFAULT '',
  website    VARCHAR(300) NOT NULL DEFAULT '',
  descricao  TEXT         NOT NULL,
  logotipo   VARCHAR(500) NOT NULL DEFAULT '',
  ordem      INT          NOT NULL DEFAULT 99
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orgaos (
  id       CHAR(36)     NOT NULL PRIMARY KEY,
  orgao    VARCHAR(80)  NOT NULL,
  cargo    VARCHAR(120) NOT NULL,
  nome     VARCHAR(180) NOT NULL,
  empresa  VARCHAR(180) NOT NULL DEFAULT '',
  linkedin VARCHAR(300) NOT NULL DEFAULT '',
  ordem    INT          NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS institucional (
  id     CHAR(36)     NOT NULL PRIMARY KEY,
  chave  VARCHAR(80)  NOT NULL UNIQUE,
  rotulo VARCHAR(160) NOT NULL,
  valor  LONGTEXT     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mensagens (
  id        CHAR(36)     NOT NULL PRIMARY KEY,
  nome      VARCHAR(120) NOT NULL,
  empresa   VARCHAR(160) NOT NULL DEFAULT '',
  email     VARCHAR(255) NOT NULL,
  assunto   VARCHAR(200) NOT NULL,
  mensagem  TEXT         NOT NULL,
  criadaEm  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lida      TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX idx_mensagens_data (criadaEm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Utilizador inicial (substituir o hash por um gerado com password_hash('SUA_PASSWORD', PASSWORD_DEFAULT))
-- INSERT INTO utilizadores (id, nome, email, palavra_passe)
-- VALUES (UUID(), 'Administrador', 'admin@aidam.co.mz', '$2y$10$SUBSTITUIR_PELO_HASH');
