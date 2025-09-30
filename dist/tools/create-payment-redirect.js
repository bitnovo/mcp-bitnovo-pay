// MCP tool for creating web redirect payments
import { getLogger } from '../utils/logger.js';
import { generateOptimizedQrCode, } from '../utils/image-utils.js';
import { getQrCache } from '../utils/qr-cache.js';
const logger = getLogger();
export const createPaymentRedirectTool = {
    name: 'create_payment_redirect',
    description: 'Create a web payment link/URL to share with customer via message, email, or social media. USE THIS WHEN: User wants to send a payment LINK to their customer (not show address directly). The customer clicks the link, chooses their preferred cryptocurrency in Bitnovo\'s gateway, and pays. RESULT: Returns a web_url that you share with your customer. EXAMPLES: "Create payment link", "Generate link to send customer", "I need URL to share via WhatsApp", "Payment link for 25 euros". NOTE: Customer can choose ANY available cryptocurrency in the gateway (not limited to one).',
    inputSchema: {
        type: 'object',
        properties: {
            amount_eur: {
                type: 'number',
                minimum: 0.01,
                description: 'Payment amount in EUR (must be positive)',
            },
            url_ok: {
                type: 'string',
                format: 'uri',
                description: 'Success redirect URL where customer returns after successful payment',
            },
            url_ko: {
                type: 'string',
                format: 'uri',
                description: 'Failure redirect URL where customer returns after payment failure or cancellation',
            },
            fiat: {
                type: 'string',
                pattern: '^[A-Z]{3}$',
                description: 'ISO 4217 currency code for the fiat amount (supports EUR, USD, and other major currencies)',
                default: 'EUR',
            },
            notes: {
                type: 'string',
                maxLength: 256,
                description: 'Optional payment description or reference',
            },
            include_qr: {
                type: 'boolean',
                default: false,
                description: 'If true, includes QR code for the web URL in the response',
            },
        },
        required: ['amount_eur', 'url_ok', 'url_ko'],
        additionalProperties: false,
    },
};
export class CreatePaymentRedirectHandler {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async handle(args) {
        const startTime = Date.now();
        logger.info('Processing create_payment_redirect request', {
            operation: 'create_payment_redirect',
            timestamp: new Date().toISOString(),
        });
        try {
            // Validate URLs format before processing (additional validation)
            this.validateInputUrls(args);
            // Create payment through service
            const payment = await this.paymentService.createRedirectPayment(args);
            const response = {
                identifier: payment.identifier,
                web_url: payment.webUrl,
                expires_at: payment.expiresAt?.toISOString(),
            };
            // Generate QR code if requested
            const inputArgs = args;
            if (inputArgs?.include_qr === true && payment.webUrl) {
                const cache = getQrCache();
                const cachedWebUrl = cache.get(payment.identifier, 'web_url', 300, 'basic', true);
                if (cachedWebUrl) {
                    response.qr_web_url = cachedWebUrl;
                }
                else {
                    const qrOptions = {
                        size: 300,
                        includeBranding: true,
                        style: 'basic', // No cryptocurrency logo for redirect payments
                        currencySymbol: undefined,
                        isGatewayUrl: true,
                        useCache: true,
                    };
                    const webUrlQr = await generateOptimizedQrCode(payment.webUrl, qrOptions);
                    response.qr_web_url = {
                        data: `data:image/png;base64,${webUrlQr.buffer.toString('base64')}`,
                        format: 'png',
                        style: 'basic',
                        dimensions: `${webUrlQr.width}x${webUrlQr.height}`,
                    };
                    cache.set(payment.identifier, 'web_url', 300, 'basic', true, response.qr_web_url);
                }
                logger.debug('Generated optimized QR code for redirect payment', {
                    paymentId: payment.identifier,
                    hasWebUrlQr: !!response.qr_web_url,
                    operation: 'create_payment_redirect_qr',
                });
            }
            const duration = Date.now() - startTime;
            logger.info('create_payment_redirect completed successfully', {
                operation: 'create_payment_redirect_success',
                paymentId: payment.identifier,
                hasWebUrl: !!payment.webUrl,
                hasExpiration: !!payment.expiresAt,
                duration,
                timestamp: new Date().toISOString(),
            });
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('create_payment_redirect failed', error, {
                operation: 'create_payment_redirect_error',
                duration,
                timestamp: new Date().toISOString(),
            });
            // Re-throw the error to be handled by MCP framework
            throw error;
        }
    }
    /**
     * Additional validation for input URLs
     */
    validateInputUrls(args) {
        if (!args || typeof args !== 'object') {
            return; // Will be caught by main validation
        }
        const input = args;
        // Check URL accessibility (basic validation)
        if (input.url_ok && input.url_ko) {
            try {
                const okUrl = new URL(input.url_ok);
                const koUrl = new URL(input.url_ko);
                // Ensure HTTPS for production security
                if (process.env.NODE_ENV === 'production') {
                    if (okUrl.protocol !== 'https:') {
                        logger.warn('Success URL should use HTTPS in production', {
                            url: input.url_ok,
                            operation: 'validate_input_urls',
                        });
                    }
                    if (koUrl.protocol !== 'https:') {
                        logger.warn('Failure URL should use HTTPS in production', {
                            url: input.url_ko,
                            operation: 'validate_input_urls',
                        });
                    }
                }
                // Ensure URLs are different
                if (input.url_ok === input.url_ko) {
                    throw new Error('Success and failure URLs must be different');
                }
                // Basic domain validation
                if (okUrl.hostname === 'localhost' || koUrl.hostname === 'localhost') {
                    if (process.env.NODE_ENV === 'production') {
                        throw new Error('Localhost URLs not allowed in production');
                    }
                }
            }
            catch (error) {
                logger.error('URL validation failed', error, {
                    operation: 'validate_input_urls_error',
                });
                throw new Error(`Invalid redirect URLs: ${error.message}`);
            }
        }
    }
    /**
     * Validate that the tool response matches the expected schema
     */
    validateResponse(response) {
        // Basic validation that required fields are present
        if (!response || typeof response !== 'object') {
            return false;
        }
        if (!response.identifier || typeof response.identifier !== 'string') {
            return false;
        }
        if (!response.web_url || typeof response.web_url !== 'string') {
            return false;
        }
        // Validate UUID format for identifier
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(response.identifier)) {
            logger.warn('Invalid identifier format in response', {
                identifier: response.identifier,
                operation: 'validate_response',
            });
            return false;
        }
        // Validate web URL format
        try {
            new URL(response.web_url);
        }
        catch {
            logger.warn('Invalid web_url format in response', {
                webUrl: response.web_url,
                operation: 'validate_response',
            });
            return false;
        }
        return true;
    }
    /**
     * Extract domain from URL for logging purposes
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        }
        catch {
            return 'invalid-url';
        }
    }
    /**
     * Generate a tracking reference for the payment
     */
    generateTrackingReference() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `redirect_${timestamp}_${random}`;
    }
}
// Factory function for creating the handler
export function createPaymentRedirectHandler(paymentService) {
    return new CreatePaymentRedirectHandler(paymentService);
}
//# sourceMappingURL=create-payment-redirect.js.map