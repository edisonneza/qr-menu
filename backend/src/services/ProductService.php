<?php
// backend/src/services/ProductService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class ProductService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function countByTenant(int $tenantId): int {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) as c FROM products WHERE tenant_id = ?');
        $stmt->execute([$tenantId]);
        $r = $stmt->fetch();
        return (int)$r['c'];
    }

    public function list(int $tenantId): array {
        $stmt = $this->pdo->prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.tenant_id = ? ORDER BY p.name');
        $stmt->execute([$tenantId]);
        $rows = $stmt->fetchAll();
        return array_map(function($r) {
            return $r;
        }, $rows);
    }

    public function create(array $data): int {
        // expects tenant_id, name, base_price, category_id (nullable), description, image_url, is_active
        if (trim($data['name']) === '') throw new \InvalidArgumentException('Product name required');
        $stmt = $this->pdo->prepare('INSERT INTO products (tenant_id, category_id, name, description, base_price, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['tenant_id'],
            $data['category_id'] ?? null,
            $data['name'],
            $data['description'] ?? null,
            $data['base_price'] ?? 0.00,
            $data['image_url'] ?? null,
            $data['is_active'] ?? 1
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $tenantId, int $id, array $data): bool {
        $fields = [];
        $vals = [];
        $allowed = ['category_id','name','description','base_price','image_url','is_active'];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data)) {
                $fields[] = "$k = ?";
                $vals[] = $data[$k];
            }
        }
        if (empty($fields)) return false;
        $vals[] = $id;
        $vals[] = $tenantId;
        $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ? AND tenant_id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($vals);
    }

    public function delete(int $tenantId, int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM products WHERE id = ? AND tenant_id = ?');
        return $stmt->execute([$id, $tenantId]);
    }

    public function getById(int $tenantId, int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM products WHERE id = ? AND tenant_id = ? LIMIT 1');
        $stmt->execute([$id, $tenantId]);
        $r = $stmt->fetch();
        return $r ?: null;
    }
}
