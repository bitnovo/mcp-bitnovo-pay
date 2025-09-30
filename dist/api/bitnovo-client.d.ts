import { AxiosError } from 'axios';
import type { Configuration, CreatePaymentOnchainInput, CreatePaymentRedirectInput, Payment, PaymentStatus, Currency, ApiError } from '../types/index.js';
export interface BitnovoApiResponse<T = unknown> {
    status: string;
    data?: T;
    error?: string;
    message?: string;
}
export interface BitnovoCreateOrderRequest {
    expected_output_amount: number;
    input_currency?: string;
    fiat?: string;
    notes?: string | undefined;
    url_ok?: string;
    url_ko?: string;
    reference?: string;
    order_type?: 'in' | 'out';
}
export interface BitnovoOrderResponse {
    identifier: string;
    reference?: string;
    created_at?: string;
    expired_at?: string;
    fiat?: string;
    language?: string;
    amount?: number;
    status?: string;
    input_currency?: string;
    address?: string;
    tag_memo?: string;
    url_standby?: string;
    url_ko?: string;
    url_ok?: string;
    web_url?: string;
    payment_uri?: string;
    input_amount?: number;
    expected_input_amount?: number;
    rate?: number;
    notes?: string;
}
export interface BitnovoPaymentInfoResponse {
    identifier: string;
    status: string;
    crypto_amount?: number;
    confirmed_amount?: number;
    unconfirmed_amount?: number;
    exchange_rate?: number;
    network_fee?: number;
    expired_time?: string;
}
export interface BitnovoCurrencyResponse {
    symbol: string;
    name: string;
    min_amount: number;
    max_amount: number | null;
    image: string;
    blockchain: string;
}
export declare class BitnovoApiError extends Error implements ApiError {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode: number, code: string, details?: unknown);
    static fromAxiosError(error: AxiosError): BitnovoApiError;
    static fromTimeout(): BitnovoApiError;
}
export declare class BitnovoApiClient {
    private readonly httpClient;
    private readonly config;
    constructor(config: Configuration);
    private shouldRetry;
    private retryRequest;
    private calculateRetryDelay;
    private sleep;
    /**
     * Create on-chain payment order
     */
    createOnchainPayment(input: CreatePaymentOnchainInput): Promise<Payment>;
    /**
     * Create web redirect payment order
     */
    createRedirectPayment(input: CreatePaymentRedirectInput): Promise<Payment>;
    /**
     * Get payment status information
     */
    getPaymentStatus(identifier: string): Promise<PaymentStatus>;
    /**
     * Get full payment details including address and payment_uri
     * Uses fallback to payment status endpoint if direct details endpoint is not available
     */
    getPaymentDetails(identifier: string): Promise<Payment>;
    /**
     * Get available currencies catalog
     */
    getCurrencies(): Promise<Currency[]>;
    private getDefaultDecimals;
    /**
     * Get timeout for specific currency based on performance analysis and testing
     * These values are optimized based on observed behavior during comprehensive testing
     */
    private getCurrencyTimeout;
    /**
     * Health check endpoint
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
export declare function createBitnovoApiClient(config: Configuration): BitnovoApiClient;
//# sourceMappingURL=bitnovo-client.d.ts.map