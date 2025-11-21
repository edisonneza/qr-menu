<?php
// backend/api/register.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\TenantService;
use App\Services\UserService;
use App\Auth\JwtAuth;

$payload = getJsonPayload();

try {
    requireFields($payload, ['tenant_name', 'slug', 'email', 'password']);
    if (!filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Invalid email');

    $pdo = App\Services\DB::getPDO($config);
    $tenantSvc = new TenantService($pdo);
    $userSvc = new UserService($pdo);

    // uniqueness checks
    if ($tenantSvc->findBySlug($payload['slug'])) jsonSend(['success' => false, 'error' => 'Slug already exists'], 400);
    if ($userSvc->findByEmail($payload['email'])) jsonSend(['success' => false, 'error' => 'Email already registered'], 400);

    $pdo->beginTransaction();
    $tenantId = $tenantSvc->createTenant($payload['tenant_name'], $payload['slug'], $payload['email']);
    $userId = $userSvc->createUser($tenantId, $payload['tenant_name'], $payload['email'], $payload['password']);
    // create subscription default handled by DB triggers or separate insertion; for brevity skip
    $pdo->commit();

    // create token
    $jwt = new JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
    $token = $jwt->createToken(['user_id' => $userId, 'tenant_id' => $tenantId, 'email' => $payload['email']]);

    jsonSend(['success' => true, 'data' => ['token' => $token, 'user' => ['id' => $userId, 'name' => $payload['tenant_name'], 'tenant_id' => $tenantId, 'email' => $payload['email']]]]);
} catch (InvalidArgumentException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
} catch (Exception $ex) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    jsonSend(['success' => false, 'error' => $ex->getMessage()], 500);
}
