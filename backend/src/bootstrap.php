<?php
// backend/src/bootstrap.php
declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

$config = require __DIR__ . '/../config/config.php';

// create uploads dir
if (!is_dir($config['uploads_dir'])) {
    mkdir($config['uploads_dir'], 0755, true);
}

// common headers + CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
