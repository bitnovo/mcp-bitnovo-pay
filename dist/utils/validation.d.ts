import { z } from 'zod';
import type { CreatePaymentOnchainInput, CreatePaymentRedirectInput, GetPaymentStatusInput, ListCurrenciesCatalogInput, PaymentStatusCode } from '../types/index.js';
export declare const createPaymentOnchainSchema: z.ZodObject<{
    amount_eur: z.ZodNumber;
    input_currency: z.ZodString;
    fiat: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    input_currency: string;
    amount_eur: number;
    notes?: string | undefined;
    fiat?: string | undefined;
}, {
    input_currency: string;
    amount_eur: number;
    notes?: string | undefined;
    fiat?: string | undefined;
}>;
export declare const createPaymentRedirectSchema: z.ZodObject<{
    amount_eur: z.ZodNumber;
    url_ok: z.ZodOptional<z.ZodString>;
    url_ko: z.ZodOptional<z.ZodString>;
    fiat: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount_eur: number;
    notes?: string | undefined;
    fiat?: string | undefined;
    url_ok?: string | undefined;
    url_ko?: string | undefined;
}, {
    amount_eur: number;
    notes?: string | undefined;
    fiat?: string | undefined;
    url_ok?: string | undefined;
    url_ko?: string | undefined;
}>;
export declare const getPaymentStatusSchema: z.ZodObject<{
    identifier: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
}, {
    identifier: string;
}>;
export declare const listCurrenciesCatalogSchema: z.ZodObject<{
    filter_by_amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    filter_by_amount?: number | undefined;
}, {
    filter_by_amount?: number | undefined;
}>;
export interface ValidationSuccess<T> {
    success: true;
    data: T;
}
export interface ValidationError {
    success: false;
    error: {
        message: string;
        field?: string;
        code: string;
    };
}
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;
export declare function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): ValidationResult<T>;
export declare function validateCreatePaymentOnchain(input: unknown): ValidationResult<CreatePaymentOnchainInput>;
export declare function validateCreatePaymentRedirect(input: unknown): ValidationResult<CreatePaymentRedirectInput>;
export declare function validateGetPaymentStatus(input: unknown): ValidationResult<GetPaymentStatusInput>;
export declare function validateListCurrenciesCatalog(input: unknown): ValidationResult<ListCurrenciesCatalogInput>;
export declare function validateAmountForCurrency(amount: number, currency: {
    minAmount: number;
    maxAmount: number | null;
}): ValidationResult<number>;
export declare function validatePaymentStatus(status: string): ValidationResult<PaymentStatusCode>;
export declare const envConfigSchema: z.ZodObject<{
    BITNOVO_DEVICE_ID: z.ZodString;
    BITNOVO_BASE_URL: z.ZodString;
    BITNOVO_DEVICE_SECRET: z.ZodOptional<z.ZodString>;
    LOG_LEVEL: z.ZodOptional<z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>>;
    NODE_ENV: z.ZodOptional<z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>>;
    API_TIMEOUT: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    MAX_RETRIES: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    RETRY_DELAY: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    WEBHOOK_ENABLED: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    WEBHOOK_PORT: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    WEBHOOK_HOST: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    WEBHOOK_PATH: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    WEBHOOK_MAX_EVENTS: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    WEBHOOK_EVENT_TTL_MS: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    TUNNEL_ENABLED: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    TUNNEL_PROVIDER: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ngrok", "zrok", "manual"]>>>;
    NGROK_AUTHTOKEN: z.ZodOptional<z.ZodString>;
    NGROK_DOMAIN: z.ZodOptional<z.ZodString>;
    ZROK_TOKEN: z.ZodOptional<z.ZodString>;
    ZROK_UNIQUE_NAME: z.ZodOptional<z.ZodString>;
    WEBHOOK_PUBLIC_URL: z.ZodOptional<z.ZodString>;
    TUNNEL_HEALTH_CHECK_INTERVAL: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    TUNNEL_RECONNECT_MAX_RETRIES: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    TUNNEL_RECONNECT_BACKOFF_MS: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    BITNOVO_DEVICE_ID: string;
    BITNOVO_BASE_URL: string;
    WEBHOOK_ENABLED: boolean;
    TUNNEL_ENABLED: boolean;
    BITNOVO_DEVICE_SECRET?: string | undefined;
    LOG_LEVEL?: "error" | "info" | "warn" | "debug" | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    API_TIMEOUT?: number | undefined;
    MAX_RETRIES?: number | undefined;
    RETRY_DELAY?: number | undefined;
    WEBHOOK_PORT?: number | undefined;
    WEBHOOK_HOST?: string | undefined;
    WEBHOOK_PATH?: string | undefined;
    TUNNEL_PROVIDER?: "ngrok" | "zrok" | "manual" | undefined;
    WEBHOOK_PUBLIC_URL?: string | undefined;
    NGROK_AUTHTOKEN?: string | undefined;
    NGROK_DOMAIN?: string | undefined;
    ZROK_TOKEN?: string | undefined;
    ZROK_UNIQUE_NAME?: string | undefined;
    TUNNEL_HEALTH_CHECK_INTERVAL?: number | undefined;
    TUNNEL_RECONNECT_MAX_RETRIES?: number | undefined;
    TUNNEL_RECONNECT_BACKOFF_MS?: number | undefined;
    WEBHOOK_MAX_EVENTS?: number | undefined;
    WEBHOOK_EVENT_TTL_MS?: number | undefined;
}, {
    BITNOVO_DEVICE_ID: string;
    BITNOVO_BASE_URL: string;
    BITNOVO_DEVICE_SECRET?: string | undefined;
    LOG_LEVEL?: "error" | "info" | "warn" | "debug" | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    API_TIMEOUT?: number | undefined;
    MAX_RETRIES?: number | undefined;
    RETRY_DELAY?: number | undefined;
    WEBHOOK_ENABLED?: unknown;
    WEBHOOK_PORT?: number | undefined;
    WEBHOOK_HOST?: string | undefined;
    WEBHOOK_PATH?: string | undefined;
    TUNNEL_ENABLED?: unknown;
    TUNNEL_PROVIDER?: "ngrok" | "zrok" | "manual" | undefined;
    WEBHOOK_PUBLIC_URL?: string | undefined;
    NGROK_AUTHTOKEN?: string | undefined;
    NGROK_DOMAIN?: string | undefined;
    ZROK_TOKEN?: string | undefined;
    ZROK_UNIQUE_NAME?: string | undefined;
    TUNNEL_HEALTH_CHECK_INTERVAL?: number | undefined;
    TUNNEL_RECONNECT_MAX_RETRIES?: number | undefined;
    TUNNEL_RECONNECT_BACKOFF_MS?: number | undefined;
    WEBHOOK_MAX_EVENTS?: number | undefined;
    WEBHOOK_EVENT_TTL_MS?: number | undefined;
}>;
export declare function validateEnvironmentConfig(env: Record<string, string | undefined>): ValidationResult<z.infer<typeof envConfigSchema>>;
export declare function isValidUuid(value: string): boolean;
export declare function isValidCurrencySymbol(value: string): boolean;
export declare function isValidUrl(value: string): boolean;
export declare function sanitizeNotes(notes: string | undefined): string | undefined;
export declare function normalizeAmount(amount: number): number;
export declare function getHttpStatusForValidationError(code: string): number;
//# sourceMappingURL=validation.d.ts.map