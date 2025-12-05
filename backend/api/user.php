<?php
// api/user.php

declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\TenantService;
use App\Auth\JwtAuth;
use App\Services\UserService;

$pdo = App\Services\DB::getPDO($config);
$userService = new UserService($pdo);

$method = $_SERVER['REQUEST_METHOD'];

$token = extractBearerToken();
if (!$token) jsonSend(['success' => false, 'error' => 'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid token'], 401);


if ($method === 'GET' && isset($_GET['userId'])) {
    $userId = (int)$_GET['userId'];
    // $user = $userService->findById($payload['user_id'] ?? 0);
    //verify that the requested userId matches the authenticated user's ID
    //and user is the tenant admin 
    if ($userId !== (int)$payload['user_id']) {
        jsonSend(['success' => false, 'error' => 'Unauthorized'], 403);
    }
    
    $user = $userService->findById($userId);
    if (!$user) jsonSend(['success'=>false,'error'=>'Not found'], 404);

    unset($user['password_hash']);

    jsonSend(['success'=>true,'data'=>$user]);
}

if ($method === 'GET'){
    $users = $userService->getAllUsersByTenantId((int)$payload['tenant_id']);
    foreach ($users as &$user) {
        unset($user['password_hash']);
    }

    jsonSend(['success'=>true,'data'=>['items'=> $users, 'itemCount'=> count($users)]]);
}