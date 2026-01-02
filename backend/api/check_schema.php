<?php
require_once __DIR__ . '/../src/bootstrap.php';

use App\Services\DB;

$pdo = DB::getPDO($config);
$stmt = $pdo->query('DESCRIBE users');
echo "Users table schema:\n";
echo str_repeat('=', 80) . "\n";
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    printf("%-20s %-20s %-10s %-10s %-20s\n", 
        $row['Field'], 
        $row['Type'], 
        $row['Null'], 
        $row['Key'], 
        $row['Default'] ?? 'NULL'
    );
}
