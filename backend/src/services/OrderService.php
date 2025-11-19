<?php
// backend/src/services/OrderService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class OrderService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function create(int $tenantId, array $items, float $total, string $channel = 'web', ?string $tableNo = null): int {
        // items: array of {product_id, qty, variant_id?}
        $items_json = json_encode($items, JSON_UNESCAPED_UNICODE);
        $stmt = $this->pdo->prepare('INSERT INTO orders (tenant_id, items_json, total, channel, table_no) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$tenantId, $items_json, $total, $channel, $tableNo]);
        return (int)$this->pdo->lastInsertId();
    }

    public function list(int $tenantId): array {
        $stmt = $this->pdo->prepare('SELECT * FROM orders WHERE tenant_id = ? ORDER BY created_at DESC');
        $stmt->execute([$tenantId]);
        return $stmt->fetchAll();
    }

    public function get(int $tenantId, int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM orders WHERE tenant_id = ? AND id = ? LIMIT 1');
        $stmt->execute([$tenantId, $id]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function updateStatus(int $tenantId, int $id, string $status): bool {
        $stmt = $this->pdo->prepare('UPDATE orders SET status = ? WHERE id = ? AND tenant_id = ?');
        return $stmt->execute([$status, $id, $tenantId]);
    }
}
