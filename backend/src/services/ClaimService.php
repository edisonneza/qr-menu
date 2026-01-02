<?php
// services/ClaimService.php

namespace App\Services;

use PDO;

class ClaimService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all available claims grouped by resource
     */
    public function getAllClaims(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT id, name, resource, action, description 
             FROM claims 
             ORDER BY resource, action"
        );
        $stmt->execute();
        $claims = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group by resource
        $grouped = [];
        foreach ($claims as $claim) {
            $resource = $claim['resource'];
            if (!isset($grouped[$resource])) {
                $grouped[$resource] = [];
            }
            $grouped[$resource][] = $claim;
        }

        return $grouped;
    }

    /**
     * Get all claims as flat array
     */
    public function getAllClaimsFlat(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT id, name, resource, action, description 
             FROM claims 
             ORDER BY resource, action"
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get default claims for a role
     */
    public function getRoleDefaultClaims(string $role): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT c.id, c.name, c.resource, c.action, c.description
             FROM claims c
             INNER JOIN role_claims rc ON c.id = rc.claim_id
             WHERE rc.role = :role
             ORDER BY c.resource, c.action"
        );
        $stmt->execute(['role' => $role]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all claims for a specific user (role defaults + user-specific overrides)
     * Returns array with claim names as keys and boolean values
     */
    public function getUserClaims(int $userId): array
    {
        // First, get user's role
        $stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = :userId");
        $stmt->execute(['userId' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [];
        }

        // Get role default claims
        $roleDefaults = $this->getRoleDefaultClaims($user['role']);
        $claims = [];
        foreach ($roleDefaults as $claim) {
            $claims[$claim['name']] = true;
        }

        // Get user-specific overrides
        $stmt = $this->pdo->prepare(
            "SELECT c.name, uc.granted
             FROM user_claims uc
             INNER JOIN claims c ON uc.claim_id = c.id
             WHERE uc.user_id = :userId"
        );
        $stmt->execute(['userId' => $userId]);
        $overrides = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Apply overrides
        foreach ($overrides as $override) {
            $claims[$override['name']] = (bool)$override['granted'];
        }

        return $claims;
    }

    /**
     * Get user claims with full details (for UI display)
     * Returns array with claim info and whether user has it
     */
    public function getUserClaimsDetailed(int $userId): array
    {
        // Get user's role
        $stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = :userId");
        $stmt->execute(['userId' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [];
        }

        // Get all claims with role defaults and user overrides
        $stmt = $this->pdo->prepare(
            "SELECT 
                c.id,
                c.name,
                c.resource,
                c.action,
                c.description,
                CASE 
                    WHEN uc.granted IS NOT NULL THEN uc.granted
                    WHEN rc.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END as has_claim,
                CASE 
                    WHEN uc.granted IS NOT NULL THEN 'override'
                    WHEN rc.id IS NOT NULL THEN 'role_default'
                    ELSE 'none'
                END as source,
                uc.granted_by,
                uc.granted_at
             FROM claims c
             LEFT JOIN role_claims rc ON c.id = rc.claim_id AND rc.role = :role
             LEFT JOIN user_claims uc ON c.id = uc.claim_id AND uc.user_id = :userId
             ORDER BY c.resource, c.action"
        );
        $stmt->execute(['role' => $user['role'], 'userId' => $userId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Check if user has a specific claim
     */
    public function userHasClaim(int $userId, string $claimName): bool
    {
        $claims = $this->getUserClaims($userId);
        return isset($claims[$claimName]) && $claims[$claimName] === true;
    }

    /**
     * Grant or revoke a claim for a specific user
     */
    public function updateUserClaim(int $userId, int $claimId, bool $granted, int $modifiedBy, int $tenantId): bool
    {
        // Get current state for audit
        $stmt = $this->pdo->prepare(
            "SELECT granted FROM user_claims WHERE user_id = :userId AND claim_id = :claimId"
        );
        $stmt->execute(['userId' => $userId, 'claimId' => $claimId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);
        $previousValue = $current ? (bool)$current['granted'] : null;

        // Insert or update user claim
        $stmt = $this->pdo->prepare(
            "INSERT INTO user_claims (user_id, claim_id, granted, granted_by, granted_at)
             VALUES (:userId, :claimId, :granted, :grantedBy, NOW())
             ON DUPLICATE KEY UPDATE 
                granted = VALUES(granted),
                granted_by = VALUES(granted_by),
                granted_at = NOW()"
        );
        
        $result = $stmt->execute([
            'userId' => $userId,
            'claimId' => $claimId,
            'granted' => $granted ? 1 : 0,
            'grantedBy' => $modifiedBy
        ]);

        // Log the change
        if ($result) {
            $this->logClaimChange($userId, $claimId, $granted ? 'granted' : 'revoked', $modifiedBy, $tenantId, $previousValue, $granted);
        }

        return $result;
    }

    /**
     * Update multiple claims for a user at once
     */
    public function updateUserClaims(int $userId, array $claimIds, int $modifiedBy, int $tenantId): bool
    {
        $this->pdo->beginTransaction();

        try {
            // Get all claims
            $allClaims = $this->getAllClaimsFlat();
            
            foreach ($allClaims as $claim) {
                $granted = in_array($claim['id'], $claimIds);
                $this->updateUserClaim($userId, (int)$claim['id'], $granted, $modifiedBy, $tenantId);
            }

            $this->pdo->commit();
            return true;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Remove user-specific claim override (revert to role default)
     */
    public function removeUserClaimOverride(int $userId, int $claimId): bool
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM user_claims WHERE user_id = :userId AND claim_id = :claimId"
        );
        return $stmt->execute(['userId' => $userId, 'claimId' => $claimId]);
    }

    /**
     * Get audit log for a user's permission changes
     */
    public function getUserClaimAuditLog(int $userId, int $limit = 50): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT 
                cal.id,
                cal.action,
                cal.previous_value,
                cal.new_value,
                cal.created_at,
                c.name as claim_name,
                c.description as claim_description,
                u.name as modified_by_name,
                u.email as modified_by_email
             FROM claim_audit_log cal
             INNER JOIN claims c ON cal.claim_id = c.id
             INNER JOIN users u ON cal.modified_by = u.id
             WHERE cal.user_id = :userId
             ORDER BY cal.created_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Log a claim change to audit log
     */
    private function logClaimChange(
        int $userId,
        int $claimId,
        string $action,
        int $modifiedBy,
        int $tenantId,
        ?bool $previousValue,
        bool $newValue
    ): void {
        $stmt = $this->pdo->prepare(
            "INSERT INTO claim_audit_log 
             (user_id, claim_id, action, modified_by, tenant_id, previous_value, new_value, created_at)
             VALUES (:userId, :claimId, :action, :modifiedBy, :tenantId, :previousValue, :newValue, NOW())"
        );
        
        $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':claimId', $claimId, PDO::PARAM_INT);
        $stmt->bindValue(':action', $action, PDO::PARAM_STR);
        $stmt->bindValue(':modifiedBy', $modifiedBy, PDO::PARAM_INT);
        $stmt->bindValue(':tenantId', $tenantId, PDO::PARAM_INT);
        
        // Handle NULL for previous_value properly
        if ($previousValue === null) {
            $stmt->bindValue(':previousValue', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':previousValue', $previousValue ? 1 : 0, PDO::PARAM_INT);
        }
        
        $stmt->bindValue(':newValue', $newValue ? 1 : 0, PDO::PARAM_INT);
        
        $stmt->execute();
    }

    /**
     * Get claim by name
     */
    public function getClaimByName(string $name): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM claims WHERE name = :name");
        $stmt->execute(['name' => $name]);
        $claim = $stmt->fetch(PDO::FETCH_ASSOC);
        return $claim ?: null;
    }

    /**
     * Prevent admin from removing their own critical claims
     */
    public function canModifyUserClaim(int $targetUserId, int $modifyingUserId, string $claimName): array
    {
        // If user is trying to modify their own admin claims, prevent it
        if ($targetUserId === $modifyingUserId) {
            $criticalClaims = ['users.manage_permissions', 'tenant.edit'];
            if (in_array($claimName, $criticalClaims)) {
                return [
                    'allowed' => false,
                    'reason' => 'Cannot remove your own critical permissions'
                ];
            }
        }

        return ['allowed' => true];
    }
}
