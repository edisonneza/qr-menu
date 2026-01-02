<?php
// api/roles.php
// API endpoints for managing roles and their permissions

declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/middleware/claim.php';

use App\Services\DB;
use App\Auth\JwtAuth;
use App\Services\RoleService;

global $config;

$pdo = App\Services\DB::getPDO($config);
$roleService = new RoleService($pdo);

$method = $_SERVER['REQUEST_METHOD'];

// Authenticate
$token = extractBearerToken();
if (!$token) jsonSend(['success' => false, 'error' => 'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid token'], 401);

// GET /api/admin/roles - Get all roles
if ($method === 'GET' && !isset($_GET['role'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $roles = $roleService->getAllRoles();
    
    // Add metadata to each role
    foreach ($roles as &$role) {
        $metadata = $roleService->getRoleMetadata($role['role']);
        $role = array_merge($role, $metadata);
    }
    
    jsonSend([
        'success' => true,
        'data' => [
            'items' => $roles,
            'itemCount' => count($roles)
        ]
    ]);
}

// GET /api/admin/roles/{role}/users - Get users with specific role
if ($method === 'GET' && isset($_GET['role']) && isset($_GET['users'])) {
    requireClaim($payload, $pdo, 'users.view');
    
    $role = $_GET['role'];
    
    if (!$roleService->isValidRole($role)) {
        jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
    }
    
    $users = $roleService->getUsersByRole($role, (int)$payload['tenant_id']);
    
    jsonSend([
        'success' => true,
        'data' => [
            'role' => $role,
            'users' => $users
        ]
    ]);
}

// GET /api/admin/roles/{role} - Get specific role with claims
if ($method === 'GET' && isset($_GET['role']) && !isset($_GET['users'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $role = $_GET['role'];
    
    if (!$roleService->isValidRole($role)) {
        jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
    }
    
    $roleData = $roleService->getRoleWithClaims($role);
    $metadata = $roleService->getRoleMetadata($role);
    $stats = $roleService->getRoleStats($role);
    
    // Get detailed claims (all claims with has_claim flag)
    $detailedClaims = $roleService->getRoleClaimsDetailed($role);
    
    jsonSend([
        'success' => true,
        'data' => array_merge($roleData, $metadata, $stats, [
            'detailed_claims' => $detailedClaims
        ])
    ]);
}

// PUT /api/admin/roles/{role}/claims - Update role claims
if ($method === 'PUT' && isset($_GET['role'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $role = $_GET['role'];
    $data = getJsonPayload();
    
    try {
        if (!$roleService->isValidRole($role)) {
            jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
        }
        
        requireFields($data, ['claim_ids']);
        
        if (!is_array($data['claim_ids'])) {
            jsonSend(['success' => false, 'error' => 'claim_ids must be an array'], 400);
        }
        
        // Update role claims
        $roleService->updateRoleClaims($role, $data['claim_ids']);
        
        // Return updated role data
        $updatedRole = $roleService->getRoleWithClaims($role);
        $detailedClaims = $roleService->getRoleClaimsDetailed($role);
        
        jsonSend([
            'success' => true,
            'message' => 'Role permissions updated successfully',
            'data' => array_merge($updatedRole, [
                'detailed_claims' => $detailedClaims
            ])
        ]);
        
    } catch (InvalidArgumentException $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// PUT /api/admin/roles/{role}/metadata - Update role metadata (title, description, color)
if ($method === 'PUT' && isset($_GET['role']) && isset($_GET['metadata'])) {
    requireClaim($payload, $pdo, 'users.manage_permissions');
    
    $role = $_GET['role'];
    $data = getJsonPayload();
    
    try {
        if (!$roleService->isValidRole($role)) {
            jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
        }
        
        // Update role metadata
        $success = $roleService->updateRoleMetadata($role, $data);
        
        if (!$success) {
            jsonSend(['success' => false, 'error' => 'No fields to update'], 400);
        }
        
        // Return updated role data
        $updatedRole = $roleService->getRoleWithClaims($role);
        
        jsonSend([
            'success' => true,
            'message' => 'Role details updated successfully',
            'data' => $updatedRole
        ]);
        
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// GET /api/admin/roles/{role}/users - Get users with specific role
if ($method === 'GET' && isset($_GET['role']) && isset($_GET['users'])) {
    requireClaim($payload, $pdo, 'users.view');
    
    $role = $_GET['role'];
    
    if (!$roleService->isValidRole($role)) {
        jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
    }
    
    $users = $roleService->getUsersByRole($role, (int)$payload['tenant_id']);
    
    jsonSend([
        'success' => true,
        'data' => [
            'role' => $role,
            'users' => $users
        ]
    ]);
}
