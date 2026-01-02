<?php
// api/user.php

declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\TenantService;
use App\Auth\JwtAuth;
use App\Services\UserService;

global $config;

$pdo = App\Services\DB::getPDO($config);
$userService = new UserService($pdo);

$method = $_SERVER['REQUEST_METHOD'];

$token = extractBearerToken();
if (!$token) jsonSend(['success' => false, 'error' => 'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid token'], 401);

// GET single user by ID
if ($method === 'GET' && isset($_GET['userId'])) {
    $userId = (int)$_GET['userId'];
    
    $user = $userService->findById($userId);
    if (!$user) jsonSend(['success'=>false,'error'=>'Not found'], 404);
    
    // Check if user belongs to same tenant
    if ($user['tenant_id'] !== (int)$payload['tenant_id']) {
        jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
    }

    unset($user['password_hash']);
    jsonSend(['success'=>true,'data'=>$user]);
}

// GET all users for tenant
if ($method === 'GET'){
    $users = $userService->getAllUsersByTenantId((int)$payload['tenant_id']);
    foreach ($users as &$user) {
        unset($user['password_hash']);
    }

    jsonSend(['success'=>true,'data'=>['items'=> $users, 'itemCount'=> count($users)]]);
}

// POST - Create new user
if ($method === 'POST') {
    $data = getJsonPayload();
    
    try {
        requireFields($data, ['name', 'email', 'password', 'role']);
        
        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            jsonSend(['success' => false, 'error' => 'Invalid email format'], 400);
        }
        
        // Check if email already exists
        if ($userService->findByEmail($data['email'])) {
            jsonSend(['success' => false, 'error' => 'Email already exists'], 400);
        }
        
        // Validate role
        if (!in_array($data['role'], ['admin', 'manager', 'staff'])) {
            jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
        }
        
        // Create user
        $userId = $userService->createUser(
            (int)$payload['tenant_id'],
            $data['name'],
            $data['email'],
            $data['password'],
            $data['role'],
            $data['phone'] ?? null,
            $data['is_active'] ?? true
        );
        
        $user = $userService->findById($userId);
        unset($user['password_hash']);
        
        jsonSend(['success' => true, 'data' => $user], 201);
        
    } catch (InvalidArgumentException $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// PUT - Update user
if ($method === 'PUT' && isset($_GET['id'])) {
    $userId = (int)$_GET['id'];
    $data = getJsonPayload();
    
    try {
        // Get existing user
        $user = $userService->findById($userId);
        if (!$user) jsonSend(['success'=>false,'error'=>'User not found'], 404);
        
        // Check if user belongs to same tenant
        if ($user['tenant_id'] !== (int)$payload['tenant_id']) {
            jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
        }
        
        // Validate email if provided
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            jsonSend(['success' => false, 'error' => 'Invalid email format'], 400);
        }
        
        // Check if new email already exists (and it's not the current user's email)
        if (isset($data['email']) && $data['email'] !== $user['email']) {
            if ($userService->findByEmail($data['email'])) {
                jsonSend(['success' => false, 'error' => 'Email already exists'], 400);
            }
        }
        
        // Validate role if provided
        if (isset($data['role']) && !in_array($data['role'], ['admin', 'manager', 'staff'])) {
            jsonSend(['success' => false, 'error' => 'Invalid role'], 400);
        }
        
        // Update user
        $userService->updateUser($userId, $data);
        
        $updatedUser = $userService->findById($userId);
        unset($updatedUser['password_hash']);
        
        jsonSend(['success' => true, 'data' => $updatedUser]);
        
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// DELETE - Delete user
if ($method === 'DELETE' && isset($_GET['id'])) {
    $userId = (int)$_GET['id'];
    
    try {
        // Get existing user
        $user = $userService->findById($userId);
        if (!$user) jsonSend(['success'=>false,'error'=>'User not found'], 404);
        
        // Check if user belongs to same tenant
        if ($user['tenant_id'] !== (int)$payload['tenant_id']) {
            jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
        }
        
        // Prevent self-deletion
        if ($userId === (int)$payload['user_id']) {
            jsonSend(['success' => false, 'error' => 'Cannot delete your own account'], 400);
        }
        
        // Delete user
        $userService->deleteUser($userId);
        
        jsonSend(['success' => true, 'message' => 'User deleted successfully']);
        
    } catch (Exception $e) {
        jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
