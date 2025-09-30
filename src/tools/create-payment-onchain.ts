// MCP tool for creating on-chain cryptocurrency payments

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PaymentService } from '../services/payment-service.js';
import type { CurrencyService } from '../services/currency-service.js';
import type { QrCodeData, CreatePaymentOnchainOutput } from '../types/index.js';
import { getLogger } from '../utils/logger.js';
import {
  generateOptimizedQrCode,
  type ImageProcessingOptions,
} from '../utils/image-utils.js';
import { getQrCache } from '../utils/qr-cache.js';

const logger = getLogger();

export const createPaymentOnchainTool: Tool = {
  name: 'create_payment_onchain',
  description:
    'Generate specific cryptocurrency address and QR codes. USE ONLY WHEN: User explicitly mentions a cryptocurrency name (Bitcoin, BTC, Ethereum, ETH, USDC, etc.). Customer MUST pay with that exact crypto. RESULT: Returns crypto address, payment URI, QR codes, and EXPIRATION TIME. IMPORTANT: Payment timer starts IMMEDIATELY when crypto is selected - always inform user of expiration deadline from expires_at field. EXAMPLES: "Bitcoin payment", "Generate ETH address", "I need USDC QR", "BTC for 50 euros", "Create Ethereum payment". DO NOT USE for generic payments without specified cryptocurrency - use create_payment_link instead. Note: Exchange rate is not included in response for privacy and accuracy reasons.',
  inputSchema: {
    type: 'object',
    properties: {
      amount_eur: {
        type: 'number',
        minimum: 0.01,
        description: 'Payment amount in EUR (must be positive)',
      },
      input_currency: {
        type: 'string',
        pattern: '^[A-Z0-9_]+$',
        description:
          'Cryptocurrency symbol (REQUIRED). Options: BTC_TEST, ETH_TEST, USDC_ETH_TEST, etc. Use list_currencies_catalog to see all available. The customer MUST pay in this specific cryptocurrency.',
      },
      fiat: {
        type: 'string',
        pattern: '^[A-Z]{3}$',
        description:
          'ISO 4217 currency code for the fiat amount (supports EUR, USD, and other major currencies)',
        default: 'EUR',
      },
      notes: {
        type: 'string',
        maxLength: 256,
        description: 'Optional payment description or reference',
      },
      include_qr: {
        type: 'boolean',
        default: true,
        description:
          'If true, includes QR codes in the response (RECOMMENDED: always true for immediate use). If false, generate later with generate_payment_qr.',
      },
    },
    required: ['amount_eur', 'input_currency'],
    additionalProperties: false,
  },
};

export class CreatePaymentOnchainHandler {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly currencyService: CurrencyService
  ) {}

  async handle(args: unknown): Promise<{
    identifier: string;
    address?: string;
    payment_uri?: string;
    expected_input_amount?: number;
    rate?: number;
    input_currency?: string;
    tag_memo?: string;
    qr_address?: QrCodeData;
    qr_payment_uri?: QrCodeData;
  }> {
    const startTime = Date.now();

    logger.info('Processing create_payment_onchain request', {
      operation: 'create_payment_onchain',
      timestamp: new Date().toISOString(),
    });

    try {
      // Create payment through service
      const payment = await this.paymentService.createOnchainPayment(args);

      const response: CreatePaymentOnchainOutput = {
        identifier: payment.identifier,
        address: payment.address,
        payment_uri: payment.paymentUri,
        expected_input_amount: payment.expectedInputAmount,
        input_currency: payment.currency!,
        // Extract tag/memo from payment URI or address for currencies that require it
        tag_memo: this.extractTagMemo(payment.paymentUri, payment.currency),
        expires_at: payment.expiresAt?.toISOString(),
      };

      // Generate QR codes if requested
      const inputArgs = args as { include_qr?: boolean };
      if (inputArgs.include_qr === true) {
        const cache = getQrCache();

        // Get currency information for image URL
        const currency = payment.currency
          ? await this.currencyService.findCurrency(payment.currency)
          : null;

        const qrOptions: ImageProcessingOptions = {
          size: 512,
          includeBranding: true,
          style: 'branded',
          currencySymbol: payment.currency,
          currencyImageUrl: currency?.network_image || undefined,
          useCache: true,
        };

        // Check cache first, then generate optimized QR codes
        if (payment.address) {
          const cachedAddress = cache.get(
            payment.identifier,
            'address',
            512,
            'branded',
            true
          );
          if (cachedAddress) {
            response.qr_address = cachedAddress;
          } else {
            const addressQr = await generateOptimizedQrCode(
              payment.address,
              qrOptions
            );
            response.qr_address = {
              data: `data:image/png;base64,${addressQr.buffer.toString('base64')}`,
              format: 'png' as const,
              style: 'branded',
              dimensions: `${addressQr.width}x${addressQr.height}`,
            };
            cache.set(
              payment.identifier,
              'address',
              512,
              'branded',
              true,
              response.qr_address
            );
          }
        }

        if (payment.paymentUri) {
          const cachedPaymentUri = cache.get(
            payment.identifier,
            'payment_uri',
            512,
            'branded',
            true
          );
          if (cachedPaymentUri) {
            response.qr_payment_uri = cachedPaymentUri;
          } else {
            const paymentUriQr = await generateOptimizedQrCode(
              payment.paymentUri,
              qrOptions
            );
            response.qr_payment_uri = {
              data: `data:image/png;base64,${paymentUriQr.buffer.toString('base64')}`,
              format: 'png' as const,
              style: 'branded',
              dimensions: `${paymentUriQr.width}x${paymentUriQr.height}`,
            };
            cache.set(
              payment.identifier,
              'payment_uri',
              512,
              'branded',
              true,
              response.qr_payment_uri
            );
          }
        }

        logger.debug('Generated optimized QR codes for onchain payment', {
          paymentId: payment.identifier,
          hasAddressQr: !!response.qr_address,
          hasPaymentUriQr: !!response.qr_payment_uri,
          currency: payment.currency,
          operation: 'create_payment_onchain_qr',
        });
      }

      const duration = Date.now() - startTime;

      logger.info('create_payment_onchain completed successfully', {
        operation: 'create_payment_onchain_success',
        paymentId: payment.identifier,
        currency: payment.currency,
        hasAddress: !!payment.address,
        hasPaymentUri: !!payment.paymentUri,
        duration,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('create_payment_onchain failed', error as Error, {
        operation: 'create_payment_onchain_error',
        duration,
        timestamp: new Date().toISOString(),
      });

      // Re-throw the error to be handled by MCP framework
      throw error;
    }
  }

  /**
   * Extract tag/memo from payment URI for currencies that require it
   */
  private extractTagMemo(
    paymentUri?: string,
    currency?: string
  ): string | undefined {
    if (!paymentUri || !currency) {
      return undefined;
    }

    // Currencies that typically require memo/tag
    const memoRequiredCurrencies = ['XRP', 'XLM', 'ALGO'];
    if (!memoRequiredCurrencies.includes(currency)) {
      return undefined;
    }

    try {
      const url = new URL(paymentUri);

      // Extract from different URI parameter names based on currency
      const tagParams = ['dt', 'tag', 'memo', 'message'];

      for (const param of tagParams) {
        const value = url.searchParams.get(param);
        if (value) {
          logger.debug(`Extracted ${param} for ${currency}`, {
            currency,
            paramType: param,
            operation: 'extract_tag_memo',
          });
          return value;
        }
      }

      return undefined;
    } catch (error) {
      logger.warn('Failed to extract tag/memo from payment URI', {
        currency,
        error: (error as Error).message,
        operation: 'extract_tag_memo_error',
      });
      return undefined;
    }
  }

  /**
   * Validate that the tool response matches the expected schema
   */
  private validateResponse(response: unknown): boolean {
    // Basic validation that required fields are present
    if (!response || typeof response !== 'object') {
      return false;
    }

    const resp = response as Record<string, unknown>;
    if (!resp.identifier || typeof resp.identifier !== 'string') {
      return false;
    }

    // Validate UUID format for identifier
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resp.identifier)) {
      logger.warn('Invalid identifier format in response', {
        identifier: resp.identifier,
        operation: 'validate_response',
      });
      return false;
    }

    return true;
  }
}

// Factory function for creating the handler
export function createPaymentOnchainHandler(
  paymentService: PaymentService,
  currencyService: CurrencyService
): CreatePaymentOnchainHandler {
  return new CreatePaymentOnchainHandler(paymentService, currencyService);
}
