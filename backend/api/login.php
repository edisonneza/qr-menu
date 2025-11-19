<?php
// backend/api/login.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\UserService;
use App\Services\TenantService;
use App\Auth\JwtAuth;

$data = getJsonPayload();
try {
    requireFields($data, ['email', 'password']);
    $pdo = App\Services\DB::getPDO($config);
    $userSvc = new UserService($pdo);
    $user = $userSvc->findByEmail($data['email']);
    if (!$user) jsonSend(['success' => false, 'error' => 'Invalid credentials'], 401);
    if (!password_verify($data['password'], $user['password_hash'])) jsonSend(['success' => false, 'error' => 'Invalid credentials'], 401);

    $tenantSvc = new TenantService($pdo);
    $tenant = $tenantSvc->getById((int)$user['tenant_id']);
    $jwt = new JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
    $token = $jwt->createToken(['user_id' => $user['id'], 'tenant_id' => $user['tenant_id'], 'email' => $user['email']]);

    unset($user['password_hash']);
    jsonSend(['success' => true, 'data' => ['token' => $token, 'user' => $user, 'tenant' => $tenant]]);
} catch (InvalidArgumentException $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
}
