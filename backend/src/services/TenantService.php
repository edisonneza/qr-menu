<?php
// backend/src/services/TenantService.php
declare(strict_types=1);
namespace App\Services;

use PDO;

class TenantService {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function createTenant(string $name, string $slug, string $email, array $data = []): int {
        $stmt = $this->pdo->prepare('INSERT INTO tenants (name, slug, email, phone, whatsapp_number, logo_url, color_theme, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $name,
            $slug,
            $email,
            $data['phone'] ?? null,
            $data['whatsapp_number'] ?? null,
            $data['logo_url'] ?? null,
            $data['color_theme'] ?? null,
            $data['plan_id'] ?? 1
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function findBySlug(string $slug): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM tenants WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM tenants WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function update(int $tenantId, array $fields): bool {
        $allowed = ['name','phone','whatsapp_number','logo_url','color_theme'];
        $parts = [];
        $values = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $fields)) {
                $parts[] = "$k = ?";
                $values[] = $fields[$k];
            }
        }
        if (empty($parts)) return false;
        $values[] = $tenantId;
        $sql = 'UPDATE tenants SET ' . implode(', ', $parts) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }
}
