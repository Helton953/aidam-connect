<?php
/**
 * API REST do CMS da AIDAM (PHP 8 + MySQL).
 *
 * Instalação: colocar esta pasta em https://aidam.co.mz/api/ e definir as
 * credenciais em config.php. O front-end deve usar VITE_API_URL=https://aidam.co.mz/api
 */

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $config['origem_permitida']);
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function responder(int $codigo, mixed $dados = null): never
{
    http_response_code($codigo);
    if ($dados !== null) {
        echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function erro(int $codigo, string $mensagem): never
{
    responder($codigo, ['erro' => $mensagem]);
}

$pdo = new PDO(
    sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['host'], $config['base_dados']),
    $config['utilizador'],
    $config['palavra_passe'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$corpo = json_decode(file_get_contents('php://input') ?: '[]', true) ?: [];
$metodo = $_SERVER['REQUEST_METHOD'];
$caminho = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '', '/');
$base = trim($config['caminho_base'], '/');
if ($base !== '' && str_starts_with($caminho, $base)) {
    $caminho = trim(substr($caminho, strlen($base)), '/');
}
$segmentos = $caminho === '' ? [] : explode('/', $caminho);
$recurso = $segmentos[0] ?? '';
$id = $segmentos[1] ?? null;

/* ---------------------------- autenticação ---------------------------- */

function utilizadorAutenticado(PDO $pdo): ?array
{
    $cabecalho = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/Bearer\s+(\S+)/', $cabecalho, $m)) {
        return null;
    }
    $stmt = $pdo->prepare(
        'SELECT u.id, u.nome, u.email FROM sessoes s
         JOIN utilizadores u ON u.id = s.utilizador_id
         WHERE s.token = ? AND s.expira_em > NOW()'
    );
    $stmt->execute([$m[1]]);
    return $stmt->fetch() ?: null;
}

function exigirAutenticacao(PDO $pdo): array
{
    $utilizador = utilizadorAutenticado($pdo);
    if (!$utilizador) {
        erro(401, 'Não autorizado.');
    }
    return $utilizador;
}

if ($recurso === 'auth') {
    $accao = $segmentos[1] ?? '';

    if ($accao === 'login' && $metodo === 'POST') {
        $email = trim((string) ($corpo['email'] ?? ''));
        $palavraPasse = (string) ($corpo['palavra_passe'] ?? '');
        $stmt = $pdo->prepare('SELECT * FROM utilizadores WHERE email = ?');
        $stmt->execute([$email]);
        $utilizador = $stmt->fetch();
        if (!$utilizador || !password_verify($palavraPasse, $utilizador['palavra_passe'])) {
            erro(401, 'Credenciais inválidas.');
        }
        $token = bin2hex(random_bytes(32));
        $pdo->prepare('INSERT INTO sessoes (token, utilizador_id, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 12 HOUR))')
            ->execute([$token, $utilizador['id']]);
        responder(200, [
            'token' => $token,
            'utilizador' => ['id' => $utilizador['id'], 'nome' => $utilizador['nome'], 'email' => $utilizador['email']],
        ]);
    }

    if ($accao === 'me' && $metodo === 'GET') {
        responder(200, exigirAutenticacao($pdo));
    }

    if ($accao === 'logout' && $metodo === 'POST') {
        $cabecalho = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(\S+)/', $cabecalho, $m)) {
            $pdo->prepare('DELETE FROM sessoes WHERE token = ?')->execute([$m[1]]);
        }
        responder(204);
    }

    erro(404, 'Rota não encontrada.');
}

/* ------------------------------- recursos ------------------------------- */

$tabelas = [
    'noticias' => ['slug', 'titulo', 'data', 'categoria', 'resumo', 'imagem', 'imagemAlt', 'corpo', 'publicada'],
    'associados' => ['nome', 'marcas', 'categorias', 'website', 'descricao', 'logotipo', 'ordem'],
    'orgaos' => ['orgao', 'cargo', 'nome', 'empresa', 'linkedin', 'ordem'],
    'institucional' => ['chave', 'rotulo', 'valor'],
    'mensagens' => ['nome', 'empresa', 'email', 'assunto', 'mensagem', 'lida'],
];

if (!isset($tabelas[$recurso])) {
    erro(404, 'Recurso não encontrado.');
}

$colunas = $tabelas[$recurso];
$ordenacao = match ($recurso) {
    'noticias' => 'data DESC',
    'associados', 'orgaos' => 'ordem ASC, nome ASC',
    'mensagens' => 'criadaEm DESC',
    default => 'rotulo ASC',
};

// Leitura pública apenas do conteúdo publicado; escrita pública apenas de mensagens.
$publico = ($metodo === 'GET' && in_array($recurso, ['noticias', 'associados', 'orgaos', 'institucional'], true) && !utilizadorAutenticado($pdo))
    || ($metodo === 'POST' && $recurso === 'mensagens');

if (!$publico) {
    exigirAutenticacao($pdo);
}

if ($metodo === 'GET') {
    $sql = "SELECT * FROM {$recurso}";
    if ($publico && $recurso === 'noticias') {
        $sql .= ' WHERE publicada = 1';
    }
    $registos = $pdo->query("{$sql} ORDER BY {$ordenacao}")->fetchAll();
    foreach ($registos as &$registo) {
        if (isset($registo['publicada'])) $registo['publicada'] = (bool) $registo['publicada'];
        if (isset($registo['lida'])) $registo['lida'] = (bool) $registo['lida'];
        if (isset($registo['ordem'])) $registo['ordem'] = (int) $registo['ordem'];
        unset($registo['palavra_passe']);
    }
    responder(200, $registos);
}

if ($metodo === 'POST') {
    $valores = [];
    foreach ($colunas as $coluna) {
        $valor = $corpo[$coluna] ?? '';
        $valores[$coluna] = is_bool($valor) ? (int) $valor : $valor;
    }
    if ($recurso === 'mensagens') {
        // Validação do formulário público
        if (mb_strlen(trim((string) $valores['nome'])) < 2
            || !filter_var($valores['email'], FILTER_VALIDATE_EMAIL)
            || mb_strlen(trim((string) $valores['mensagem'])) < 10
            || mb_strlen((string) $valores['mensagem']) > 2000) {
            erro(422, 'Dados inválidos.');
        }
        $valores['lida'] = 0;
    }
    $novoId = $pdo->query('SELECT UUID()')->fetchColumn();
    $campos = array_merge(['id'], array_keys($valores));
    $marcadores = implode(', ', array_fill(0, count($campos), '?'));
    $pdo->prepare(sprintf('INSERT INTO %s (%s) VALUES (%s)', $recurso, implode(', ', $campos), $marcadores))
        ->execute(array_merge([$novoId], array_values($valores)));
    $stmt = $pdo->prepare("SELECT * FROM {$recurso} WHERE id = ?");
    $stmt->execute([$novoId]);
    responder(201, $stmt->fetch());
}

if (!$id) {
    erro(400, 'Identificador em falta.');
}

if ($metodo === 'PUT') {
    $definicoes = [];
    $valores = [];
    foreach ($colunas as $coluna) {
        if (array_key_exists($coluna, $corpo)) {
            $definicoes[] = "{$coluna} = ?";
            $valores[] = is_bool($corpo[$coluna]) ? (int) $corpo[$coluna] : $corpo[$coluna];
        }
    }
    if (!$definicoes) {
        erro(400, 'Nada para actualizar.');
    }
    $valores[] = $id;
    $pdo->prepare(sprintf('UPDATE %s SET %s WHERE id = ?', $recurso, implode(', ', $definicoes)))->execute($valores);
    $stmt = $pdo->prepare("SELECT * FROM {$recurso} WHERE id = ?");
    $stmt->execute([$id]);
    responder(200, $stmt->fetch());
}

if ($metodo === 'DELETE') {
    $pdo->prepare("DELETE FROM {$recurso} WHERE id = ?")->execute([$id]);
    responder(204);
}

erro(405, 'Método não permitido.');
