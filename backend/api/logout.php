<?php
// backend/api/logout.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\RefreshTokenService;
use App\Auth\JwtAuth;

global $config;

$data = getJsonPayload();

try {
    $pdo = App\Services\DB::getPDO($config);
    $refreshTokenSvc = new RefreshTokenService($pdo);
    
    // If refresh token is provided, revoke it
    if (isset($data['refresh_token'])) {
        $refreshTokenSvc->revokeToken($data['refresh_token']);
    }
    
    // Optionally: If access token is provided, extract user_id and revoke all tokens
    $token = extractBearerToken();
    if ($token) {
        $jwt = new JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
        $payload = $jwt->validate($token);
        
        if ($payload && isset($payload['user_id'])) {
            // Revoke all refresh tokens for this user
            $refreshTokenSvc->revokeAllUserTokens((int)$payload['user_id']);
        }
    }
    
    jsonSend(['success' => true, 'message' => 'Logged out successfully']);
    
} catch (Exception $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
}
