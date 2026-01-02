<?php
// services/RoleService.php

namespace App\Services;

use PDO;
use Exception;

class RoleService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all available roles with their claim counts
     */
    public function getAllRoles(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT 
                r.id,
                r.name as role,
                r.title,
                r.description,
                r.color,
                r.is_system_role,
                COUNT(DISTINCT rc.claim_id) as claim_count,
                COUNT(DISTINCT u.id) as user_count
             FROM roles r
             LEFT JOIN role_claims rc ON r.name = rc.role
             LEFT JOIN users u ON r.name = u.role
             GROUP BY r.id, r.name, r.title, r.description, r.color, r.is_system_role
             ORDER BY 
                CASE r.name
                    WHEN 'admin' THEN 1
                    WHEN 'manager' THEN 2
                    WHEN 'staff' THEN 3
                    ELSE 4
                END, r.name"
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get role details with all assigned claims
     */
    public function getRoleWithClaims(string $role): array
    {
        // Get role basic info from roles table
        $stmt = $this->pdo->prepare(
            "SELECT 
                r.id,
                r.name as role,
                r.title,
                r.description,
                r.color,
                r.is_system_role,
                COUNT(DISTINCT rc.claim_id) as claim_count,
                COUNT(DISTINCT u.id) as user_count
             FROM roles r
             LEFT JOIN role_claims rc ON r.name = rc.role
             LEFT JOIN users u ON r.name = u.role
             WHERE r.name = :role
             GROUP BY r.id, r.name, r.title, r.description, r.color, r.is_system_role"
        );
        $stmt->execute(['role' => $role]);
        $roleInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$roleInfo) {
            return [];
        }

        // Get assigned claims
        $stmt = $this->pdo->prepare(
            "SELECT c.id, c.name, c.resource, c.action, c.description
             FROM role_claims rc
             INNER JOIN claims c ON rc.claim_id = c.id
             WHERE rc.role = :role
             ORDER BY c.resource, c.action"
        );
        $stmt->execute(['role' => $role]);
        $claims = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_merge($roleInfo, ['claims' => $claims]);
    }

    /**
     * Get role with detailed claim info (has_claim for each available claim)
     */
    public function getRoleClaimsDetailed(string $role): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT 
                c.id,
                c.name,
                c.resource,
                c.action,
                c.description,
                CASE WHEN rc.id IS NOT NULL THEN TRUE ELSE FALSE END as has_claim
             FROM claims c
             LEFT JOIN role_claims rc ON c.id = rc.claim_id AND rc.role = :role
             ORDER BY c.resource, c.action"
        );
        $stmt->execute(['role' => $role]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update role's claims
     * @param string $role Role name
     * @param array $claimIds Array of claim IDs to assign to this role
     */
    public function updateRoleClaims(string $role, array $claimIds): bool
    {
        $this->pdo->beginTransaction();

        try {
            // Delete existing role claims
            $stmt = $this->pdo->prepare("DELETE FROM role_claims WHERE role = :role");
            $stmt->execute(['role' => $role]);

            // Insert new claims
            if (!empty($claimIds)) {
                $stmt = $this->pdo->prepare(
                    "INSERT INTO role_claims (role, claim_id) VALUES (:role, :claimId)"
                );

                foreach ($claimIds as $claimId) {
                    $stmt->execute([
                        'role' => $role,
                        'claimId' => (int)$claimId
                    ]);
                }
            }

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Check if role is valid
     */
    public function isValidRole(string $role): bool
    {
        return in_array($role, ['admin', 'manager', 'staff']);
    }

    /**
     * Get users assigned to a role
     */
    public function getUsersByRole(string $role, int $tenantId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT id, name, email, is_active, created_at
             FROM users
             WHERE role = :role AND tenant_id = :tenantId
             ORDER BY name"
        );
        $stmt->execute(['role' => $role, 'tenantId' => $tenantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get role statistics
     */
    public function getRoleStats(string $role): array
    {
        // Get total users with this role
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) as total_users FROM users WHERE role = :role"
        );
        $stmt->execute(['role' => $role]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get active users
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) as active_users FROM users WHERE role = :role AND is_active = TRUE"
        );
        $stmt->execute(['role' => $role]);
        $activeStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get claim count
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) as claim_count FROM role_claims WHERE role = :role"
        );
        $stmt->execute(['role' => $role]);
        $claimStats = $stmt->fetch(PDO::FETCH_ASSOC);

        return [
            'role' => $role,
            'total_users' => $stats['total_users'] ?? 0,
            'active_users' => $activeStats['active_users'] ?? 0,
            'claim_count' => $claimStats['claim_count'] ?? 0
        ];
    }

    /**
     * Get role description/metadata
     */
    public function getRoleMetadata(string $role): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT title, description, color FROM roles WHERE name = :role"
        );
        $stmt->execute(['role' => $role]);
        $metadata = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($metadata) {
            return $metadata;
        }

        // Fallback for roles not in database
        return [
            'title' => ucfirst($role),
            'description' => 'Custom role',
            'color' => 'default'
        ];
    }

    /**
     * Update role metadata (title, description, color)
     */
    public function updateRoleMetadata(string $role, array $data): bool
    {
        $allowedFields = ['title', 'description', 'color'];
        $updates = [];
        $params = ['role' => $role];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE roles SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE name = :role";
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute($params);
    }
}
