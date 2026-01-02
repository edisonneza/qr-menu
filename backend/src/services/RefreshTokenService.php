<?php
// backend/src/services/RefreshTokenService.php
declare(strict_types=1);
namespace App\Services;

use PDO;
use DateTime;

class RefreshTokenService {
    private PDO $pdo;
    
    public function __construct(PDO $pdo) { 
        $this->pdo = $pdo; 
    }

    /**
     * Store a new refresh token for a user
     * @param int $userId
     * @param string $token
     * @param int $expiresInDays (default: 30 days)
     * @return bool
     */
    public function storeRefreshToken(int $userId, string $token, int $expiresInDays = 30): bool {
        $expiresAt = (new DateTime())->modify("+{$expiresInDays} days")->format('Y-m-d H:i:s');
        
        $stmt = $this->pdo->prepare(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
        );
        return $stmt->execute([$userId, $token, $expiresAt]);
    }

    /**
     * Validate a refresh token and return user ID if valid
     * @param string $token
     * @return int|null User ID if token is valid, null otherwise
     */
    public function validateRefreshToken(string $token): ?int {
        $stmt = $this->pdo->prepare(
            'SELECT user_id, expires_at, revoked_at 
             FROM refresh_tokens 
             WHERE token = ? 
             LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();

        if (!$row) {
            return null; // Token doesn't exist
        }

        // Check if token was revoked
        if ($row['revoked_at'] !== null) {
            return null;
        }

        // Check if token has expired
        $expiresAt = new DateTime($row['expires_at']);
        $now = new DateTime();
        if ($now > $expiresAt) {
            return null;
        }

        return (int)$row['user_id'];
    }

    /**
     * Revoke a specific refresh token
     * @param string $token
     * @return bool
     */
    public function revokeToken(string $token): bool {
        $stmt = $this->pdo->prepare(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?'
        );
        return $stmt->execute([$token]);
    }

    /**
     * Revoke all refresh tokens for a user (e.g., on logout)
     * @param int $userId
     * @return bool
     */
    public function revokeAllUserTokens(int $userId): bool {
        $stmt = $this->pdo->prepare(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL'
        );
        return $stmt->execute([$userId]);
    }

    /**
     * Clean up expired tokens (can be run periodically)
     * @return int Number of deleted tokens
     */
    public function cleanupExpiredTokens(): int {
        $stmt = $this->pdo->prepare(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
        );
        $stmt->execute();
        return $stmt->rowCount();
    }
}
