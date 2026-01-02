<?php
// backend/api/refresh.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\UserService;
use App\Services\TenantService;
use App\Services\RefreshTokenService;
use App\Auth\JwtAuth;

global $config;

$data = getJsonPayload();

try {
    requireFields($data, ['refresh_token']);
    
    $pdo = App\Services\DB::getPDO($config);
    $refreshTokenSvc = new RefreshTokenService($pdo);
    
    // Validate the refresh token and get user ID
    $userId = $refreshTokenSvc->validateRefreshToken($data['refresh_token']);
    
    if (!$userId) {
        jsonSend(['success' => false, 'error' => 'Invalid or expired refresh token'], 401);
    }

    // Get user details
    $userSvc = new UserService($pdo);
    $user = $userSvc->findById($userId);
    
    if (!$user) {
        jsonSend(['success' => false, 'error' => 'User not found'], 404);
    }

    // Get tenant details
    $tenantSvc = new TenantService($pdo);
    $tenant = $tenantSvc->getById((int)$user['tenant_id']);

    // Create new access token
    $jwt = new JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
    $newAccessToken = $jwt->createToken([
        'user_id' => $user['id'], 
        'name' => $user['name'], 
        'tenant_id' => $user['tenant_id'], 
        'email' => $user['email']
    ], 3600); // 1 hour

    // Optionally: Create a new refresh token and revoke the old one (token rotation)
    $newRefreshToken = $jwt->createRefreshToken($userId);
    $refreshTokenSvc->storeRefreshToken($userId, $newRefreshToken, 30); // 30 days
    $refreshTokenSvc->revokeToken($data['refresh_token']); // Revoke old token

    unset($user['password_hash']);
    
    jsonSend([
        'success' => true, 
        'data' => [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'user' => $user,
            'tenant' => $tenant
        ]
    ]);
    
} catch (InvalidArgumentException $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
}
