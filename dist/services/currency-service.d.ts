import type { Currency, Configuration, ApiError } from '../types/index.js';
import type { BitnovoApiClient } from '../api/bitnovo-client.js';
export declare class CurrencyServiceError extends Error implements ApiError {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode: number, code: string, details?: unknown);
}
export interface CurrencyFilter {
    minAmount?: number;
    maxAmount?: number;
    filterByAmount?: number;
    includeInactive?: boolean;
    blockchain?: string;
    requiresMemo?: boolean;
}
export interface CurrencyCatalogResult {
    currencies: Currency[];
    totalCount: number;
    filteredCount: number;
    appliedFilters: CurrencyFilter;
}
export declare class CurrencyService {
    private readonly apiClient;
    private readonly config;
    private currencyCache;
    private cacheTimestamp;
    private readonly cacheMaxAge;
    constructor(apiClient: BitnovoApiClient, config: Configuration);
    /**
     * Get currencies catalog with optional filtering
     */
    getCurrenciesCatalog(input: unknown): Promise<CurrencyCatalogResult>;
    /**
     * Get all currencies with caching
     */
    getCurrencies(): Promise<Currency[]>;
    /**
     * Find a specific currency by symbol
     */
    findCurrency(symbol: string): Promise<Currency | null>;
    /**
     * Check if a currency is valid for a specific amount
     */
    isCurrencyValidForAmount(symbol: string, amount: number): Promise<boolean>;
    /**
     * Get currencies that support a specific amount
     */
    getCurrenciesForAmount(amount: number): Promise<Currency[]>;
    /**
     * Apply filtering logic to currencies list
     */
    private applyCurrencyFilters;
    /**
     * Sort currencies by priority and name
     */
    private sortCurrencies;
    /**
     * Enhance currency with additional metadata and validation
     */
    private enhanceCurrency;
    /**
     * Check if currency cache is still valid
     */
    private isCacheValid;
    /**
     * Clear currency cache (useful for testing or forced refresh)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        cached: boolean;
        age: number;
        maxAge: number;
        count: number;
        valid: boolean;
    };
    /**
     * Normalize amount to avoid floating point precision issues
     */
    private normalizeAmount;
    /**
     * Get currency display information
     */
    getCurrencyDisplayInfo(currency: Currency): {
        displayName: string;
        shortName: string;
        amountRange: string;
        features: string[];
    };
    /**
     * Validate if currencies are available for service
     */
    validateServiceAvailability(): Promise<{
        available: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=currency-service.d.ts.map