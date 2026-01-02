<?php
// backend/src/services/UserService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class UserService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function createUser(int $tenantId, string $name, string $email, string $password, string $role = 'staff', ?string $phone = null, bool $isActive = true): int {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('INSERT INTO users (tenant_id, name, email, password_hash, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$tenantId, $name, $email, $hash, $role, $phone, $isActive ? 1 : 0]);
        return (int)$this->pdo->lastInsertId();
    }

    public function updateUser(int $userId, array $data): bool {
        $allowed = ['name', 'email', 'role', 'phone', 'is_active'];
        $parts = [];
        $values = [];
        
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $parts[] = "$field = ?";
                $values[] = $field === 'is_active' ? ($data[$field] ? 1 : 0) : $data[$field];
            }
        }
        
        // Handle password separately if provided
        if (!empty($data['password'])) {
            $parts[] = "password_hash = ?";
            $values[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($parts)) {
            return false;
        }
        
        $values[] = $userId;
        $sql = 'UPDATE users SET ' . implode(', ', $parts) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAllUsersByTenantId(int $tenantId): array {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC');
        $stmt->execute([$tenantId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function deleteUser(int $userId): bool {
        $stmt = $this->pdo->prepare('DELETE FROM users WHERE id = ?');
        return $stmt->execute([$userId]);
    }
}
