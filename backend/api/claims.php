<?php
// api/claims.php
// API endpoints for managing claims and permissions

declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/middleware/claim.php';

use App\Services\DB;
use App\Auth\JwtAuth;
use App\Services\ClaimService;
use App\Services\UserService;

global $config;

$pdo = App\Services\DB::getPDO($config);
$claimService = new ClaimService($pdo);
$userService = new UserService($pdo);

$method = $_SERVER['REQUEST_METHOD'];

// Authenticate
$token = extractBearerToken();
if (!$token) jsonSend(['success' => false, 'error' => 'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid token'], 401);

// GET /api/admin/claims - Get all available claims
if ($method === 'GET' && !isset($_GET['userId'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $grouped = $claimService->getAllClaims();
    $flat = $claimService->getAllClaimsFlat();
    
    jsonSend([
        'success' => true,
        'data' => [
            'grouped' => $grouped,
            'flat' => $flat
        ]
    ]);
}

// GET /api/admin/claims?userId={id} - Get claims for specific user
if ($method === 'GET' && isset($_GET['userId'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $userId = (int)$_GET['userId'];
    
    // Verify user belongs to same tenant
    $user = $userService->findById($userId);
    if (!$user) jsonSend(['success' => false, 'error' => 'User not found'], 404);
    
    if ($user['tenant_id'] !== (int)$payload['tenant_id']) {
        jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
    }
    
    $claims = $claimService->getUserClaimsDetailed($userId);
    $auditLog = $claimService->getUserClaimAuditLog($userId, 20);
    
    jsonSend([
        'success' => true,
        'data' => [
            'user_id' => $userId,
            'user_name' => $user['name'],
            'user_role' => $user['role'],
            'claims' => $claims,
            'audit_log' => $auditLog
        ]
    ]);
}

// PUT /api/admin/claims?userId={id} - Update user claims
if ($method === 'PUT' && isset($_GET['userId'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $userId = (int)$_GET['userId'];
    $data = getJsonPayload();
    
    try {
        requireFields($data, ['claim_ids']);
        
        // Verify user belongs to same tenant
        $user = $userService->findById($userId);
        if (!$user) jsonSend(['success' => false, 'error' => 'User not found'], 404);
        
        if ($user['tenant_id'] !== (int)$payload['tenant_id']) {
            jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
        }
        
        // Validate claim_ids is an array
        if (!is_array($data['claim_ids'])) {
            jsonSend(['success' => false, 'error' => 'claim_ids must be an array'], 400);
        }
        
        // Update claims
        $claimService->updateUserClaims(
            $userId,
            $data['claim_ids'],
            (int)$payload['user_id'],
            (int)$payload['tenant_id']
        );
        
        // Return updated claims
        $updatedClaims = $claimService->getUserClaimsDetailed($userId);
        
        jsonSend([
            'success' => true,
            'message' => 'User permissions updated successfully',
            'data' => [
                'claims' => $updatedClaims
            ]
        ]);
        
    } catch (InvalidArgumentException $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// GET /api/auth/me/claims - Get current user's claims
if ($method === 'GET' && isset($_GET['me'])) {
    $claims = getUserClaimsArray($payload, $pdo);
    
    jsonSend([
        'success' => true,
        'data' => [
            'claims' => $claims
        ]
    ]);
}
