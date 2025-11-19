<?php
// backend/config/config.php
declare(strict_types=1);

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'ta_menu',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],
    // change to a secure random secret in production
    'jwt_secret' => 'CHANGE_ME_TO_A_STRONG_SECRET',
    'jwt_issuer' => 'yourdomain.example', // optional
    'uploads_dir' => __DIR__ . '/../uploads'
];
