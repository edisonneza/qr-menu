<?php
// backend/api/categories.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\CategoryService;

$pdo = App\Services\DB::getPDO($config);
$catSvc = new CategoryService($pdo);

// auth
$token = extractBearerToken();
if (!$token) jsonSend(['success' => false, 'error' => 'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success' => false, 'error' => 'Invalid token'], 401);

$tenantId = (int)$payload['tenant_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $list = $catSvc->list($tenantId);
        jsonSend(['success' => true, 'data' => $list]);
    }
    if ($method === 'POST') {
        $data = getJsonPayload();
        requireFields($data, ['name']);
        $id = $catSvc->create($tenantId, $data['name'], $data['position'] ?? 0);
        jsonSend(['success' => true, 'data' => ['id' => $id]]);
    }
    if ($method === 'PUT') {
        $data = getJsonPayload();
        requireFields($data, ['id', 'name']);
        $ok = $catSvc->update($tenantId, (int)$data['id'], $data['name'], (int)($data['position'] ?? 0));
        jsonSend(['success' => true, 'data' => ['ok' => $ok]]);
    }
    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonSend(['success' => false, 'error' => 'Missing id'], 400);
        $ok = $catSvc->delete($tenantId, $id);
        jsonSend(['success' => true, 'data' => ['ok' => $ok]]);
    }
} catch (InvalidArgumentException $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
}
