import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CurrencyService } from '../services/currency-service.js';
export declare const listCurrenciesCatalogTool: Tool;
export interface CurrencyInfo {
    symbol: string;
    name: string;
    min_amount: number;
    max_amount: number | null;
    image: string;
    blockchain: string;
    requires_memo: boolean;
    decimals: number;
    is_active: boolean;
    features: string[];
}
export declare class ListCurrenciesCatalogHandler {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    handle(args: unknown): Promise<{
        currencies: CurrencyInfo[];
        total_count: number;
        filtered_count: number;
        filter_applied: boolean;
        filter_amount?: number;
        cache_info: {
            cached: boolean;
            age: number;
            valid: boolean;
        };
    }>;
    /**
     * Get feature list for a currency
     */
    private getCurrencyFeatures;
    /**
     * Check if currency is a stablecoin
     */
    private isStablecoin;
    /**
     * Check if currency is in the popular list
     */
    private isPopularCurrency;
    /**
     * Get currency recommendation based on amount and user preferences
     */
    private getCurrencyRecommendations;
    /**
     * Generate usage statistics for currencies
     */
    private getCurrencyStats;
    /**
     * Validate that the tool response matches the expected schema
     */
    private validateResponse;
    /**
     * Validate individual currency info object
     */
    private validateCurrencyInfo;
}
export declare function listCurrenciesCatalogHandler(currencyService: CurrencyService): ListCurrenciesCatalogHandler;
//# sourceMappingURL=list-currencies-catalog.d.ts.map