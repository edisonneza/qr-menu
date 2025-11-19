<?php
// backend/api/tenant.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\TenantService;
use App\Auth\JwtAuth;

$pdo = App\Services\DB::getPDO($config);
$tenantSvc = new TenantService($pdo);

$method = $_SERVER['REQUEST_METHOD'];

// public GET by slug: /api/tenant.php?slug=demo-cafe
if ($method === 'GET' && isset($_GET['slug'])) {
    $slug = trim($_GET['slug']);
    $t = $tenantSvc->findBySlug($slug);
    if (!$t) jsonSend(['success'=>false,'error'=>'Not found'], 404);
    jsonSend(['success'=>true,'data'=>$t]);
}

// owner operations require JWT
$payload = (function() use ($config) {
    $token = extractBearerToken();
    if (!$token) jsonSend(['success'=>false,'error'=>'Missing token'], 401);
    $jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
    $pl = $jwt->validate($token);
    if (!$pl) jsonSend(['success'=>false,'error'=>'Invalid token'], 401);
    return $pl;
})();

$tenantId = (int)$payload['tenant_id'];

if ($method === 'PUT') {
    $data = getJsonPayload();
    $ok = $tenantSvc->update($tenantId, $data);
    if ($ok) jsonSend(['success'=>true]); else jsonSend(['success'=>false,'error'=>'Failed or no changes'], 400);
}

if ($method === 'GET') {
    // return tenant info for owner
    $t = $tenantSvc->getById($tenantId);
    jsonSend(['success'=>true,'data'=>$t]);
}
