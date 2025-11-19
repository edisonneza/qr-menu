<?php
// backend/src/services/UserService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class UserService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function createUser(int $tenantId, string $name, string $email, string $password): int {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('INSERT INTO users (tenant_id, name, email, password_hash) VALUES (?, ?, ?, ?)');
        $stmt->execute([$tenantId, $name, $email, $hash]);
        return (int)$this->pdo->lastInsertId();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
}
