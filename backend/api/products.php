<?php
// backend/api/products.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\ProductService;
use App\Services\PlanService;

$pdo = App\Services\DB::getPDO($config);
$productSvc = new ProductService($pdo);
$planSvc = new PlanService($pdo);

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
        $list = $productSvc->list($tenantId);
        jsonSend(['success' => true, 'data' => $list]);
    }
    if ($method === 'POST') {
        // create product
        $data = getJsonPayload();
        requireFields($data, ['name', 'base_price']);
        // enforce product limit
        $stmt = $pdo->prepare('SELECT p.product_limit FROM tenants t JOIN plans p ON t.plan_id = p.id WHERE t.id = ? LIMIT 1');
        $stmt->execute([$tenantId]);
        $planRow = $stmt->fetch();
        $productLimit = $planRow ? (int)$planRow['product_limit'] : 0;
        $currentCount = $productSvc->countByTenant($tenantId);
        if ($productLimit > 0 && $currentCount >= $productLimit) {
            jsonSend(['success' => false, 'error' => 'Product limit reached for your plan'], 403);
        }

        // image handling: accept image_url or base64_data
        if (!empty($data['image_base64'])) {
            // decode and save
            $imgData = $data['image_base64'];
            if (preg_match('/^data:(image\\/\\w+);base64,(.+)$/', $imgData, $m)) {
                $ext = explode('/', $m[1])[1];
                $content = base64_decode($m[2]);
                $fname = uniqid('img_', true) . '.' . $ext;
                $path = rtrim($config['uploads_dir'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fname;
                file_put_contents($path, $content);
                $data['image_url'] = '/uploads/' . $fname;
            }
        }

        $createData = [
            'tenant_id' => $tenantId,
            'category_id' => $data['category_id'] ?? null,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'base_price' => (float)$data['base_price'],
            'image_url' => $data['image_url'] ?? null,
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ];
        $id = $productSvc->create($createData);
        jsonSend(['success' => true, 'data' => ['id' => $id]]);
    }
    if ($method === 'PUT') {
        $data = getJsonPayload();
        requireFields($data, ['id']);
        $id = (int)$data['id'];
        $ok = $productSvc->update($tenantId, $id, $data);
        jsonSend(['success' => true, 'data' => ['ok' => $ok]]);
    }
    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonSend(['success' => false, 'error' => 'Missing id'], 400);
        $ok = $productSvc->delete($tenantId, $id);
        jsonSend(['success' => true, 'data' => ['ok' => $ok]]);
    }
} catch (InvalidArgumentException $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 400);
} catch (Exception $e) {
    jsonSend(['success' => false, 'error' => $e->getMessage()], 500);
}
