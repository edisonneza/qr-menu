<?php
// backend/src/services/PlanService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class PlanService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listPlans(): array {
        $stmt = $this->pdo->query('SELECT id, name, price, features_json, product_limit FROM plans ORDER BY id');
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) $r['features'] = json_decode($r['features_json'], true);
        return $rows;
    }

    public function getPlan(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM plans WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) $row['features'] = json_decode($row['features_json'], true);
        return $row ?: null;
    }
}
