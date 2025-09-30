import type { Payment, PaymentStatus, Configuration, ApiError } from '../types/index.js';
import type { BitnovoApiClient } from '../api/bitnovo-client.js';
export declare class PaymentServiceError extends Error implements ApiError {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode: number, code: string, details?: unknown);
}
export declare class PaymentService {
    private readonly apiClient;
    private readonly config;
    private readonly CACHE_TTL;
    constructor(apiClient: BitnovoApiClient, config: Configuration);
    /**
     * Create an on-chain cryptocurrency payment
     */
    createOnchainPayment(input: unknown): Promise<Payment>;
    /**
     * Create a web redirect payment
     */
    createRedirectPayment(input: unknown): Promise<Payment>;
    /**
     * Get full payment details by identifier
     */
    getPaymentDetails(identifier: string): Promise<Payment>;
    /**
     * Get payment status by identifier
     */
    getPaymentStatus(input: unknown): Promise<PaymentStatus>;
    /**
     * Validate redirect URLs are properly formatted
     */
    private validateRedirectUrls;
    /**
     * Enhance payment status with additional business logic and user-friendly information
     */
    private enhancePaymentStatus;
    /**
     * Check if a payment has expired based on current time
     */
    isPaymentExpired(expirationTime: string): boolean;
    /**
     * Calculate payment timeout based on configuration
     */
    getPaymentTimeout(): number;
    /**
     * Format amount for display with proper decimal places
     */
    formatAmount(amount: number, currency?: string): string;
    /**
     * Get decimal places for a currency
     */
    private getCurrencyDecimals;
}
//# sourceMappingURL=payment-service.d.ts.map