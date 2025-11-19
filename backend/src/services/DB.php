<?php
// backend/src/services/DB.php
declare(strict_types=1);
namespace App\Services;

use PDO;
use PDOException;

class DB {
    private static ?PDO $pdo = null;
    public static function getPDO(array $config): PDO {
        if (self::$pdo === null) {
            $host = $config['db']['host'];
            $name = $config['db']['name'];
            $user = $config['db']['user'];
            $pass = $config['db']['pass'];
            $charset = $config['db']['charset'] ?? 'utf8mb4';
            $dsn = "mysql:host=$host;dbname=$name;charset=$charset";
            $opt = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            self::$pdo = new PDO($dsn, $user, $pass, $opt);
        }
        return self::$pdo;
    }
}
