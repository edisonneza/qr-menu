<?php
// backend/api/qrcode.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\TenantService;

$pdo = App\Services\DB::getPDO($config);
$tenantSvc = new TenantService($pdo);

// simple: GET ?slug=...
$slug = trim($_GET['slug'] ?? '');
if ($slug === '') jsonSend(['success'=>false,'error'=>'Missing slug'], 400);
$tenant = $tenantSvc->findBySlug($slug);
if (!$tenant) jsonSend(['success'=>false,'error'=>'Tenant not found'], 404);

// Construct public menu URL — adjust host as needed
$scheme = (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : (isset($_SERVER['REQUEST_SCHEME']) ? $_SERVER['REQUEST_SCHEME'] : 'http'));
$host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
$url = $scheme . '://' . $host . '/menu/' . $tenant['slug'];

jsonSend(['success'=>true,'data'=>['url'=>$url]]);
