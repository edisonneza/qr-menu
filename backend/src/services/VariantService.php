<?php
// backend/src/services/VariantService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class VariantService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listForProduct(int $tenantId, int $productId): array {
        $stmt = $this->pdo->prepare('SELECT * FROM product_variants WHERE tenant_id = ? AND product_id = ? ORDER BY name');
        $stmt->execute([$tenantId, $productId]);
        return $stmt->fetchAll();
    }

    public function create(int $tenantId, int $productId, string $name, float $price): int {
        $stmt = $this->pdo->prepare('INSERT INTO product_variants (tenant_id, product_id, name, price) VALUES (?, ?, ?, ?)');
        $stmt->execute([$tenantId, $productId, $name, $price]);
        return (int)$this->pdo->lastInsertId();
    }

    public function delete(int $tenantId, int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM product_variants WHERE id = ? AND tenant_id = ?');
        return $stmt->execute([$id, $tenantId]);
    }
}
