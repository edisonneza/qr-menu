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

// Fetch authenticated user
$user = $userService->findById($payload['user_id'] ?? 0);
unset($user['password_hash']);

if (!$user) {
    jsonSend(["error" => "User not found"], 404);
}

// Return profile
jsonSend([
    "user" => $user
]);
