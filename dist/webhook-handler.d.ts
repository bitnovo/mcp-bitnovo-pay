import { z } from 'zod';
import type { Configuration } from './types/index.js';
/**
 * Bitnovo webhook payload schema
 * Based on PaymentSerializer from backend reference
 */
declare const WebhookPayloadSchema: z.ZodObject<{
    identifier: z.ZodString;
    status: z.ZodEnum<["NR", "PE", "AC", "IA", "OC", "CO", "CA", "EX", "FA", "RF"]>;
    fiat_amount: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    expired_at: z.ZodOptional<z.ZodString>;
    expected_input_amount: z.ZodOptional<z.ZodNumber>;
    input_amount: z.ZodOptional<z.ZodNumber>;
    confirmed_amount: z.ZodOptional<z.ZodNumber>;
    unconfirmed_amount: z.ZodOptional<z.ZodNumber>;
    crypto_amount: z.ZodOptional<z.ZodNumber>;
    exchange_rate: z.ZodOptional<z.ZodNumber>;
    network_fee: z.ZodOptional<z.ZodNumber>;
    expired_time: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    tag_memo: z.ZodOptional<z.ZodString>;
    input_currency: z.ZodOptional<z.ZodString>;
    fiat: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    payment_uri: z.ZodOptional<z.ZodString>;
    web_url: z.ZodOptional<z.ZodString>;
    good_fee: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    identifier: string;
    status: "NR" | "PE" | "AC" | "IA" | "OC" | "CO" | "CA" | "EX" | "FA" | "RF";
    address?: string | undefined;
    payment_uri?: string | undefined;
    web_url?: string | undefined;
    fiat_amount?: number | undefined;
    notes?: string | undefined;
    reference?: string | undefined;
    created_at?: string | undefined;
    expired_at?: string | undefined;
    expected_input_amount?: number | undefined;
    input_amount?: number | undefined;
    confirmed_amount?: number | undefined;
    unconfirmed_amount?: number | undefined;
    crypto_amount?: number | undefined;
    exchange_rate?: number | undefined;
    network_fee?: number | undefined;
    expired_time?: string | undefined;
    tag_memo?: string | undefined;
    input_currency?: string | undefined;
    fiat?: string | undefined;
    language?: string | undefined;
    good_fee?: boolean | undefined;
}, {
    identifier: string;
    status: "NR" | "PE" | "AC" | "IA" | "OC" | "CO" | "CA" | "EX" | "FA" | "RF";
    address?: string | undefined;
    payment_uri?: string | undefined;
    web_url?: string | undefined;
    fiat_amount?: number | undefined;
    notes?: string | undefined;
    reference?: string | undefined;
    created_at?: string | undefined;
    expired_at?: string | undefined;
    expected_input_amount?: number | undefined;
    input_amount?: number | undefined;
    confirmed_amount?: number | undefined;
    unconfirmed_amount?: number | undefined;
    crypto_amount?: number | undefined;
    exchange_rate?: number | undefined;
    network_fee?: number | undefined;
    expired_time?: string | undefined;
    tag_memo?: string | undefined;
    input_currency?: string | undefined;
    fiat?: string | undefined;
    language?: string | undefined;
    good_fee?: boolean | undefined;
}>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export interface WebhookRequest {
    headers: {
        'x-nonce'?: string;
        'x-signature'?: string;
        [key: string]: string | undefined;
    };
    body: unknown;
    rawBody: string;
}
export interface WebhookHandlerResult {
    success: boolean;
    eventId?: string;
    error?: string;
    errorCode?: string;
    statusCode: number;
}
export declare class WebhookHandler {
    private config;
    private nonceCache;
    constructor(config: Configuration);
    /**
     * Process an incoming webhook request
     * @param request - The webhook HTTP request
     * @returns Processing result with status code
     */
    handle(request: WebhookRequest): Promise<WebhookHandlerResult>;
    /**
     * Generate a unique event ID from identifier and nonce
     * @param identifier - Payment identifier
     * @param nonce - Webhook nonce
     * @returns Unique event ID
     */
    private generateEventId;
    /**
     * Get webhook handler statistics
     */
    getStats(): {
        noncesCached: number;
        hasDeviceSecret: boolean;
    };
}
/**
 * Create a webhook handler instance
 * @param config - Server configuration
 * @returns WebhookHandler instance
 */
export declare function createWebhookHandler(config: Configuration): WebhookHandler;
export {};
//# sourceMappingURL=webhook-handler.d.ts.map