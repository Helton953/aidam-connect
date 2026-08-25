-- Esquema da base de dados do website institucional da AIDAM
-- MySQL 8 / MariaDB 10.4+ — executar uma vez na base de dados criada no cPanel.

SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Administradores do painel
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  palavra_passe VARCHAR(255)  NOT NULL,  -- hash bcrypt
  activo        TINYINT(1)    NOT NULL DEFAULT 1,
  ultimo_acesso DATETIME      NULL,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Notícias
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo         VARCHAR(200) NOT NULL,
  slug           VARCHAR(200) NOT NULL,
  data           DATE         NOT NULL,
  categoria      ENUM('Associação','Mercado','Sector','Eventos') NOT NULL DEFAULT 'Associação',
  resumo         VARCHAR(500) NOT NULL,
  corpo          MEDIUMTEXT   NOT NULL,
  imagem         VARCHAR(500) NOT NULL DEFAULT '',
  imagem_alt     VARCHAR(200) NOT NULL DEFAULT '',
  publicada      TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_noticias_slug (slug),
  KEY idx_noticias_data (data),
  KEY idx_noticias_publicada (publicada, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Mensagens do formulário de contacto
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagens_contacto (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100)  NOT NULL,
  empresa       VARCHAR(120)  NULL,
  email         VARCHAR(255)  NOT NULL,
  assunto       VARCHAR(150)  NOT NULL,
  mensagem      TEXT          NOT NULL,
  ip            VARCHAR(45)   NULL,
  lida          TINYINT(1)    NOT NULL DEFAULT 0,
  email_enviado TINYINT(1)    NOT NULL DEFAULT 0,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mensagens_criado (criado_em),
  KEY idx_mensagens_lida (lida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Primeiro administrador
-- --------------------------------------------------------
-- Gerar o hash com:  npm run criar-admin
-- ou:  node -e "console.log(require('bcryptjs').hashSync('a-sua-password',12))"
--
-- INSERT INTO admins (nome, email, palavra_passe)
-- VALUES ('Administrador', 'admin@aidam.co.mz', '$2a$12$COLOCAR_AQUI_O_HASH');
