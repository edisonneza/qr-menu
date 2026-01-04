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
        // Handle currencies separately if provided
        $currencies = $fields['currency'] ?? null;
        unset($fields['currency']);
        
        $allowed = ['name','phone','whatsapp_number','logo_url','color_theme','email','address','description','business_hours','website','instagram','facebook','timezone','notifications_email'];
        $parts = [];
        $values = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $fields)) {
                $parts[] = "$k = ?";
                $values[] = $fields[$k];
            }
        }
        
        // Update tenant fields
        if (!empty($parts)) {
            $values[] = $tenantId;
            $sql = 'UPDATE tenants SET ' . implode(', ', $parts) . ' WHERE id = ?';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);
        }
        
        // Update currencies if provided
        if ($currencies !== null) {
            $this->updateCurrencies($tenantId, $currencies);
        }
        
        return true;
    }

    public function updateCurrencies(int $tenantId, array $currencyCodes): void {
        // Delete existing currencies
        $stmt = $this->pdo->prepare('DELETE FROM tenant_currencies WHERE tenant_id = ?');
        $stmt->execute([$tenantId]);
        
        // Insert new currencies
        if (!empty($currencyCodes)) {
            $stmt = $this->pdo->prepare('INSERT INTO tenant_currencies (tenant_id, currency_code, is_default) VALUES (?, ?, ?)');
            foreach ($currencyCodes as $index => $code) {
                $isDefault = $index === 0; // First currency is default
                $stmt->execute([$tenantId, $code, $isDefault ? 1 : 0]);
            }
        }
    }

    public function getCurrencies(int $tenantId): array {
        $stmt = $this->pdo->prepare('SELECT currency_code FROM tenant_currencies WHERE tenant_id = ? ORDER BY is_default DESC');
        $stmt->execute([$tenantId]);
        return array_map(fn($row) => $row['currency_code'], $stmt->fetchAll());
    }
}
