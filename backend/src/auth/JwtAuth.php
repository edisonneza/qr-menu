<?php
// backend/src/auth/JwtAuth.php
declare(strict_types=1);
namespace App\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuth {
    private string $secret;
    private string $issuer;

    public function __construct(string $secret, string $issuer = '') {
        $this->secret = $secret;
        $this->issuer = $issuer;
    }

    /**
     * Create an access token (short-lived)
     */
    public function createToken(array $payload, int $expSeconds = 3600): string {
        $now = time();
        $token = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + $expSeconds,
            'type' => 'access',
        ]);
        if ($this->issuer) $token['iss'] = $this->issuer;
        return JWT::encode($token, $this->secret, 'HS256');
    }

    /**
     * Create a refresh token (long-lived, stored in DB)
     */
    public function createRefreshToken(int $userId): string {
        // Generate a secure random token
        return bin2hex(random_bytes(32));
    }

    public function validate(string $token): ?array {
        try {
            $decoded = (array) JWT::decode($token, new Key($this->secret, 'HS256'));
            return $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}
