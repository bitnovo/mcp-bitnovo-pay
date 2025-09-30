// MCP tool for listing available cryptocurrency catalog with filtering

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CurrencyService } from '../services/currency-service.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger();

export const listCurrenciesCatalogTool: Tool = {
  name: 'list_currencies_catalog',
  description:
    'Get the catalog of available cryptocurrencies with optional amount-based filtering. USE THIS WHEN: User wants to know which cryptocurrencies are available, or before creating an onchain payment to choose input_currency. RESULT: List of available cryptos with min/max amounts, decimals, and blockchain info. EXAMPLES: "Which cryptos are available?", "What currencies support 50 euros?", "Show me available cryptocurrencies"',
  inputSchema: {
    type: 'object',
    properties: {
      filter_by_amount: {
        type: 'number',
        minimum: 0.01,
        description:
          'Optional EUR amount to filter currencies that support this payment amount. Use this if user asks "which cryptos accept 50 euros?" or similar.',
      },
    },
    additionalProperties: false,
  },
};

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

export class ListCurrenciesCatalogHandler {
  constructor(private readonly currencyService: CurrencyService) {}

  async handle(args: unknown): Promise<{
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
  }> {
    const startTime = Date.now();

    logger.info('Processing list_currencies_catalog request', {
      operation: 'list_currencies_catalog',
      timestamp: new Date().toISOString(),
    });

    try {
      // Get currencies catalog through service
      const catalogResult =
        await this.currencyService.getCurrenciesCatalog(args);

      // Transform currencies to expected format
      const currencyInfos: CurrencyInfo[] = catalogResult.currencies.map(
        currency => ({
          symbol: currency.symbol,
          name: currency.name,
          min_amount: currency.minAmount,
          max_amount: currency.maxAmount,
          image: currency.network_image,
          blockchain: currency.blockchain,
          requires_memo: currency.requiresMemo,
          decimals: currency.decimals,
          is_active: currency.isActive,
          features: this.getCurrencyFeatures(currency),
        })
      );

      // Get cache information
      const cacheStats = this.currencyService.getCacheStats();

      const response = {
        currencies: currencyInfos,
        total_count: catalogResult.totalCount,
        filtered_count: catalogResult.filteredCount,
        filter_applied: !!catalogResult.appliedFilters.filterByAmount,
        filter_amount: catalogResult.appliedFilters.filterByAmount,
        cache_info: {
          cached: cacheStats.cached,
          age: cacheStats.age,
          valid: cacheStats.valid,
        },
      };

      const duration = Date.now() - startTime;

      logger.info('list_currencies_catalog completed successfully', {
        operation: 'list_currencies_catalog_success',
        totalCount: catalogResult.totalCount,
        filteredCount: catalogResult.filteredCount,
        filterApplied: response.filter_applied,
        filterAmount: response.filter_amount,
        cached: cacheStats.cached,
        duration,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('list_currencies_catalog failed', error as Error, {
        operation: 'list_currencies_catalog_error',
        duration,
        timestamp: new Date().toISOString(),
      });

      // Re-throw the error to be handled by MCP framework
      throw error;
    }
  }

  /**
   * Get feature list for a currency
   */
  private getCurrencyFeatures(currency: {
    requiresMemo: boolean;
    blockchain: string;
    symbol: string;
    maxAmount: number | null;
  }): string[] {
    const features: string[] = [];

    if (currency.requiresMemo) {
      features.push('Requires memo/tag');
    }

    if (currency.blockchain && currency.blockchain !== currency.symbol) {
      features.push(`${currency.blockchain} network`);
    }

    if (currency.maxAmount === null) {
      features.push('No maximum limit');
    }

    // Add stability indicator for stablecoins
    if (this.isStablecoin(currency.symbol)) {
      features.push('Stablecoin');
    }

    // Add popular currency indicator
    if (this.isPopularCurrency(currency.symbol)) {
      features.push('Popular');
    }

    return features;
  }

  /**
   * Check if currency is a stablecoin
   */
  private isStablecoin(symbol: string): boolean {
    const stablecoins = ['USDC'];
    return stablecoins.includes(symbol.toUpperCase());
  }

  /**
   * Check if currency is in the popular list
   */
  private isPopularCurrency(symbol: string): boolean {
    const popularCurrencies = ['BTC', 'ETH', 'LTC', 'BCH', 'XRP'];
    return popularCurrencies.includes(symbol.toUpperCase());
  }

  /**
   * Get currency recommendation based on amount and user preferences
   */
  private getCurrencyRecommendations(
    currencies: CurrencyInfo[],
    filterAmount?: number
  ): {
    recommended: CurrencyInfo[];
    reasoning: string[];
  } {
    const recommendations: CurrencyInfo[] = [];
    const reasoning: string[] = [];

    if (!filterAmount) {
      // General recommendations without amount filter
      const btc = currencies.find(c => c.symbol === 'BTC');
      const eth = currencies.find(c => c.symbol === 'ETH');
      const usdc = currencies.find(c => c.symbol === 'USDC');

      if (btc) {
        recommendations.push(btc);
        reasoning.push('Bitcoin is the most widely accepted cryptocurrency');
      }

      if (eth) {
        recommendations.push(eth);
        reasoning.push(
          'Ethereum has broad adoption and smart contract capabilities'
        );
      }

      if (usdc) {
        recommendations.push(usdc);
        reasoning.push(
          'USDC offers price stability as a USD-pegged stablecoin'
        );
      }
    } else {
      // Amount-based recommendations
      if (filterAmount < 10) {
        reasoning.push(
          'For small amounts, consider cryptocurrencies with lower fees'
        );
        const lowFeeCurrencies = currencies.filter(c =>
          ['LTC', 'BCH', 'XRP', 'XLM'].includes(c.symbol)
        );
        recommendations.push(...lowFeeCurrencies.slice(0, 2));
      } else if (filterAmount > 1000) {
        reasoning.push(
          'For large amounts, established cryptocurrencies are recommended'
        );
        const establishedCurrencies = currencies.filter(c =>
          ['BTC', 'ETH', 'USDC'].includes(c.symbol)
        );
        recommendations.push(...establishedCurrencies.slice(0, 3));
      } else {
        reasoning.push(
          'For medium amounts, most cryptocurrencies are suitable'
        );
        const popularCurrencies = currencies.filter(c =>
          ['BTC', 'ETH', 'LTC', 'USDC'].includes(c.symbol)
        );
        recommendations.push(...popularCurrencies.slice(0, 3));
      }
    }

    return {
      recommended: recommendations.slice(0, 3), // Limit to top 3
      reasoning,
    };
  }

  /**
   * Generate usage statistics for currencies
   */
  private getCurrencyStats(currencies: CurrencyInfo[]): {
    active_count: number;
    memo_required_count: number;
    no_limit_count: number;
    stablecoin_count: number;
    popular_count: number;
  } {
    return {
      active_count: currencies.filter(c => c.is_active).length,
      memo_required_count: currencies.filter(c => c.requires_memo).length,
      no_limit_count: currencies.filter(c => c.max_amount === null).length,
      stablecoin_count: currencies.filter(c => this.isStablecoin(c.symbol))
        .length,
      popular_count: currencies.filter(c => this.isPopularCurrency(c.symbol))
        .length,
    };
  }

  /**
   * Validate that the tool response matches the expected schema
   */
  private validateResponse(response: any): boolean {
    // Basic validation that required fields are present
    if (!response || typeof response !== 'object') {
      return false;
    }

    if (!Array.isArray(response.currencies)) {
      return false;
    }

    if (typeof response.total_count !== 'number' || response.total_count < 0) {
      return false;
    }

    if (
      typeof response.filtered_count !== 'number' ||
      response.filtered_count < 0
    ) {
      return false;
    }

    // Validate each currency object
    for (const currency of response.currencies) {
      if (!this.validateCurrencyInfo(currency)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate individual currency info object
   */
  private validateCurrencyInfo(currency: any): boolean {
    if (!currency || typeof currency !== 'object') {
      return false;
    }

    const requiredFields = [
      'symbol',
      'name',
      'min_amount',
      'blockchain',
      'is_active',
    ];
    for (const field of requiredFields) {
      if (!(field in currency)) {
        logger.warn(`Missing required field in currency: ${field}`, {
          currency: currency.symbol,
          operation: 'validate_currency_info',
        });
        return false;
      }
    }

    if (typeof currency.min_amount !== 'number' || currency.min_amount < 0) {
      return false;
    }

    if (
      currency.max_amount !== null &&
      typeof currency.max_amount !== 'number'
    ) {
      return false;
    }

    return true;
  }
}

// Factory function for creating the handler
export function listCurrenciesCatalogHandler(
  currencyService: CurrencyService
): ListCurrenciesCatalogHandler {
  return new ListCurrenciesCatalogHandler(currencyService);
}
