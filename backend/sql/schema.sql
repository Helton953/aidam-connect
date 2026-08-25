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

-- --------------------------------------------------------
-- Associados (portfólio)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS associados (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(150) NOT NULL,
  marcas    VARCHAR(500) NOT NULL DEFAULT '',
  categorias VARCHAR(200) NOT NULL DEFAULT '',
  website   VARCHAR(255) NOT NULL DEFAULT '',
  descricao TEXT         NULL,
  logotipo  VARCHAR(500) NOT NULL DEFAULT '',
  ordem     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  criado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_associados_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Órgãos sociais
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS orgaos_sociais (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  orgao    VARCHAR(120) NOT NULL,
  cargo    VARCHAR(120) NOT NULL DEFAULT '',
  nome     VARCHAR(150) NOT NULL,
  empresa  VARCHAR(150) NOT NULL DEFAULT '',
  linkedin VARCHAR(255) NOT NULL DEFAULT '',
  ordem    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_orgaos (orgao, ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Blocos de conteúdo institucional (chave/rótulo/valor)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS institucional (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  chave  VARCHAR(80)  NOT NULL,
  rotulo VARCHAR(150) NOT NULL,
  valor  MEDIUMTEXT   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_institucional_chave (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Definições da plataforma (SMTP, contactos, redes sociais, etc.)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS definicoes (
  chave          VARCHAR(80) NOT NULL,
  valor          MEDIUMTEXT  NULL,
  actualizado_em DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Biblioteca de ficheiros carregados no painel
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ficheiros (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  tipo          VARCHAR(100) NOT NULL,
  tamanho       INT UNSIGNED NOT NULL DEFAULT 0,
  url           VARCHAR(500) NOT NULL,
  admin_id      INT UNSIGNED NULL,
  criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ficheiros_criado (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
