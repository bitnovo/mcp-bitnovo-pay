export interface WebhookValidationResult {
    isValid: boolean;
    error?: string;
}
export declare class CryptoError extends Error {
    constructor(message: string);
}
/**
 * Validates webhook HMAC signature using timing-safe comparison
 * Formula: hex(hmac_sha256(device_secret, nonce + raw_body))
 *
 * @param deviceSecret - The device secret key
 * @param nonce - The nonce from X-NONCE header
 * @param rawBody - The raw webhook body
 * @param receivedSignature - The signature from X-SIGNATURE header
 */
export declare function validateWebhookSignature(deviceSecret: string, nonce: string, rawBody: string, receivedSignature: string): WebhookValidationResult;
/**
 * Generates a secure random nonce for testing purposes
 */
export declare function generateNonce(length?: number): string;
/**
 * Creates HMAC signature for testing purposes
 */
export declare function createTestSignature(deviceSecret: string, nonce: string, body: string): string;
/**
 * Validates nonce format and freshness
 * Prevents replay attacks by ensuring nonces are unique within a timeframe
 */
export declare function validateNonce(nonce: string, maxAge?: number, // 5 minutes default
seenNonces?: Set<string>): {
    isValid: boolean;
    error?: string;
};
/**
 * Simple nonce cache for replay attack prevention
 * In production, consider using Redis or similar for distributed systems
 */
export declare class NonceCache {
    private cache;
    private readonly maxAge;
    constructor(maxAge?: number);
    add(nonce: string): boolean;
    private cleanup;
    size(): number;
    clear(): void;
}
export declare function getNonceCache(): NonceCache;
export declare function resetNonceCache(): void;
//# sourceMappingURL=crypto.d.ts.map