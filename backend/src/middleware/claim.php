<?php
// middleware/claim.php
// Authorization middleware to check if user has required claim

use App\Services\ClaimService;
use App\Auth\JwtAuth;

/**
 * Middleware to check if authenticated user has a required claim
 * 
 * Usage in API endpoint:
 * requireClaim($payload, $pdo, 'users.create');
 * 
 * @param array $payload JWT payload containing user_id and tenant_id
 * @param PDO $pdo Database connection
 * @param string $claimName Required claim name (e.g., 'users.create')
 * @param bool $sendError Whether to send error response and exit (default: true)
 * @return bool Returns true if user has claim, false otherwise
 */
function requireClaim(array $payload, PDO $pdo, string $claimName, bool $sendError = true): bool
{
    $claimService = new ClaimService($pdo);
    
    $userId = (int)$payload['user_id'];
    $hasClaim = $claimService->userHasClaim($userId, $claimName);
    
    if (!$hasClaim && $sendError) {
        jsonSend([
            'success' => false,
            'error' => 'Insufficient permissions',
            'required_claim' => $claimName
        ], 403);
    }
    
    return $hasClaim;
}

/**
 * Check if user has ANY of the specified claims (OR logic)
 * 
 * @param array $payload JWT payload
 * @param PDO $pdo Database connection
 * @param array $claimNames Array of claim names
 * @param bool $sendError Whether to send error response
 * @return bool
 */
function requireAnyClaim(array $payload, PDO $pdo, array $claimNames, bool $sendError = true): bool
{
    $claimService = new ClaimService($pdo);
    $userId = (int)$payload['user_id'];
    
    foreach ($claimNames as $claimName) {
        if ($claimService->userHasClaim($userId, $claimName)) {
            return true;
        }
    }
    
    if ($sendError) {
        jsonSend([
            'success' => false,
            'error' => 'Insufficient permissions',
            'required_claims' => $claimNames,
            'requires_any' => true
        ], 403);
    }
    
    return false;
}

/**
 * Check if user has ALL of the specified claims (AND logic)
 * 
 * @param array $payload JWT payload
 * @param PDO $pdo Database connection
 * @param array $claimNames Array of claim names
 * @param bool $sendError Whether to send error response
 * @return bool
 */
function requireAllClaims(array $payload, PDO $pdo, array $claimNames, bool $sendError = true): bool
{
    $claimService = new ClaimService($pdo);
    $userId = (int)$payload['user_id'];
    
    $missingClaims = [];
    
    foreach ($claimNames as $claimName) {
        if (!$claimService->userHasClaim($userId, $claimName)) {
            $missingClaims[] = $claimName;
        }
    }
    
    if (!empty($missingClaims) && $sendError) {
        jsonSend([
            'success' => false,
            'error' => 'Insufficient permissions',
            'missing_claims' => $missingClaims,
            'requires_all' => true
        ], 403);
    }
    
    return empty($missingClaims);
}

/**
 * Get user's claims for client-side permission checking
 * 
 * @param array $payload JWT payload
 * @param PDO $pdo Database connection
 * @return array Array of claim names user has access to
 */
function getUserClaimsArray(array $payload, PDO $pdo): array
{
    $claimService = new ClaimService($pdo);
    $userId = (int)$payload['user_id'];
    
    $claims = $claimService->getUserClaims($userId);
    
    // Return only claim names where value is true
    return array_keys(array_filter($claims, function($value) {
        return $value === true;
    }));
}
