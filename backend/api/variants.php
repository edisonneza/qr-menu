<?php
// backend/api/variants.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\VariantService;
use App\Services\ProductService;

$pdo = App\Services\DB::getPDO($config);
$variantSvc = new VariantService($pdo);
$productSvc = new ProductService($pdo);

// auth
$token = extractBearerToken();
if (!$token) jsonSend(['success'=>false,'error'=>'Missing token'], 401);
$jwt = new App\Auth\JwtAuth($config['jwt_secret'], $config['jwt_issuer'] ?? '');
$payload = $jwt->validate($token);
if (!$payload) jsonSend(['success'=>false,'error'=>'Invalid token'], 401);

$tenantId = (int)$payload['tenant_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $productId = (int)($_GET['product_id'] ?? 0);
        if (!$productId) jsonSend(['success'=>false,'error'=>'Missing product_id'], 400);
        $variants = $variantSvc->listForProduct($tenantId, $productId);
        jsonSend(['success'=>true,'data'=>$variants]);
    }
    if ($method === 'POST') {
        $data = getJsonPayload();
        requireFields($data, ['product_id','name','price']);
        // ensure product belongs to tenant
        $product = $productSvc->getById($tenantId, (int)$data['product_id']);
        if (!$product) jsonSend(['success'=>false,'error'=>'Product not found'], 404);
        $id = $variantSvc->create($tenantId, (int)$data['product_id'], $data['name'], (float)$data['price']);
        jsonSend(['success'=>true,'data'=>['id'=>$id]]);
    }
    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonSend(['success'=>false,'error'=>'Missing id'], 400);
        $ok = $variantSvc->delete($tenantId, $id);
        jsonSend(['success'=>true,'data'=>['ok'=>$ok]]);
    }
} catch (InvalidArgumentException $e) {
    jsonSend(['success'=>false,'error'=>$e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success'=>false,'error'=>$e->getMessage()], 500);
}
