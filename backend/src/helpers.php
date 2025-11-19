<?php
// backend/src/helpers.php
declare(strict_types=1);

function jsonSend($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonPayload(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getAuthorizationHeader(): ?string {
    // robustly get Authorization header
    if (function_exists('getallheaders')) {
        $all = getallheaders();
        if (isset($all['Authorization'])) return $all['Authorization'];
        if (isset($all['authorization'])) return $all['authorization'];
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    return null;
}

function extractBearerToken(): ?string {
    $auth = getAuthorizationHeader();
    if (!$auth) return null;
    if (preg_match('/Bearer\s+(\S+)/', $auth, $m)) return $m[1];
    return null;
}

// simple validation helpers
function requireFields(array $data, array $fields): void {
    foreach ($fields as $f) {
        if (!array_key_exists($f, $data) || $data[$f] === '' || $data[$f] === null) {
            throw new InvalidArgumentException("Missing or empty field: $f");
        }
    }
}
