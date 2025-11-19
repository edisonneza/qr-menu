<?php
// backend/api/orders.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\OrderService;
use App\Services\ProductService;

$pdo = App\Services\DB::getPDO($config);
$orderSvc = new OrderService($pdo);
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
        // list orders
        $list = $orderSvc->list($tenantId);
        jsonSend(['success'=>true,'data'=>$list]);
    }
    if ($method === 'POST') {
        $data = getJsonPayload();
        requireFields($data, ['items','total']);
        // validate items
        $items = $data['items'];
        if (!is_array($items) || empty($items)) throw new InvalidArgumentException('Items must be a non-empty array');
        $total = (float)$data['total'];
        // optional channel and table
        $channel = $data['channel'] ?? 'web';
        $tableNo = $data['table_no'] ?? null;
        $orderId = $orderSvc->create($tenantId, $items, $total, $channel, $tableNo);
        jsonSend(['success'=>true,'data'=>['id'=>$orderId]]);
    }
    if ($method === 'PATCH') {
        // update status
        $data = getJsonPayload();
        requireFields($data, ['id','status']);
        $ok = $orderSvc->updateStatus($tenantId, (int)$data['id'], $data['status']);
        jsonSend(['success'=>true,'data'=>['ok'=>$ok]]);
    }
    if ($method === 'GET' && isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $order = $orderSvc->get($tenantId, $id);
        if (!$order) jsonSend(['success'=>false,'error'=>'Not found'], 404);
        jsonSend(['success'=>true,'data'=>$order]);
    }
} catch (InvalidArgumentException $e) {
    jsonSend(['success'=>false,'error'=>$e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success'=>false,'error'=>$e->getMessage()], 500);
}
