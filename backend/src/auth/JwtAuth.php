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

    public function createToken(array $payload, int $expSeconds = 86400): string {
        $now = time();
        $token = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + $expSeconds,
        ]);
        if ($this->issuer) $token['iss'] = $this->issuer;
        return JWT::encode($token, $this->secret, 'HS256');
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
