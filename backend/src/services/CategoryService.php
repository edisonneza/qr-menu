<?php
// backend/src/services/CategoryService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class CategoryService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function list(int $tenantId): array {
        $stmt = $this->pdo->prepare('SELECT id, name, position FROM categories WHERE tenant_id = ? ORDER BY position, name');
        $stmt->execute([$tenantId]);
        return $stmt->fetchAll();
    }

    public function create(int $tenantId, string $name, int $position = 0): int {
        if (trim($name) === '') throw new \InvalidArgumentException('Category name required');
        $stmt = $this->pdo->prepare('INSERT INTO categories (tenant_id, name, position) VALUES (?, ?, ?)');
        $stmt->execute([$tenantId, $name, $position]);
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $tenantId, int $id, string $name, int $position = 0): bool {
        $stmt = $this->pdo->prepare('UPDATE categories SET name = ?, position = ? WHERE id = ? AND tenant_id = ?');
        return $stmt->execute([$name, $position, $id, $tenantId]);
    }

    public function delete(int $tenantId, int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM categories WHERE id = ? AND tenant_id = ?');
        return $stmt->execute([$id, $tenantId]);
    }
}
