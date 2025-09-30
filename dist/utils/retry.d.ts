export interface RetryOptions {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
    jitter: boolean;
}
export interface RetryContext {
    attempt: number;
    totalAttempts: number;
    lastError?: Error;
    totalDelay: number;
}
export declare class RetryableError extends Error {
    readonly retryAfter?: number | undefined;
    constructor(message: string, retryAfter?: number | undefined);
}
export declare class RetryExhaustedError extends Error {
    readonly attempts: number;
    readonly lastError?: Error | undefined;
    constructor(message: string, attempts: number, lastError?: Error | undefined);
}
export declare class RetryManager {
    private options;
    private readonly defaultOptions;
    constructor(options?: Partial<RetryOptions>);
    /**
     * Execute function with retry logic
     */
    executeWithRetry<T>(operation: (context: RetryContext) => Promise<T>, operationName?: string): Promise<T>;
    /**
     * Calculate delay for next retry attempt
     */
    private calculateDelay;
    /**
     * Check if an error should trigger a retry
     */
    private isRetryableError;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Create retry-specific error for rate limiting
     */
    static createRateLimitError(retryAfterMs?: number): RetryableError;
    /**
     * Create retry-specific error for service unavailable
     */
    static createServiceUnavailableError(retryAfterMs?: number): RetryableError;
}
export declare class RateLimiter {
    private maxRequests;
    private timeWindowMs;
    private requests;
    constructor(maxRequests: number, timeWindowMs: number);
    /**
     * Check if request is allowed under rate limit
     */
    isAllowed(): boolean;
    /**
     * Get time until next request is allowed
     */
    getRetryAfter(): number;
    /**
     * Reset rate limiter
     */
    reset(): void;
    /**
     * Get current usage statistics
     */
    getStats(): {
        currentRequests: number;
        maxRequests: number;
        timeWindowMs: number;
        nextResetMs: number;
    };
}
export declare function createRetryManager(options?: Partial<RetryOptions>): RetryManager;
export declare function createRateLimiter(maxRequests: number, timeWindowMs: number): RateLimiter;
export default RetryManager;
//# sourceMappingURL=retry.d.ts.map