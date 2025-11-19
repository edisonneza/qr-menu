<?php
// backend/src/middleware/auth.php
declare(strict_types=1);

use App\Auth\JwtAuth;
use App\Services\DB;

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../helpers.php';

function requireAuth(): array
{
    global $config;
    $token = extractBearerToken();
    if (!$token) jsonSend(['success' => false, 'error' => 'Missing Authorization token'], 401);
    $jwt = new JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
    $payload = $jwt->validate($token);
    if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid or expired token'], 401);
    // payload should contain user_id and tenant_id (we ensure that in login/register)
    return $payload;
}
