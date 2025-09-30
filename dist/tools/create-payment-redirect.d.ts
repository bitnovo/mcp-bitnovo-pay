import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PaymentService } from '../services/payment-service.js';
import type { QrCodeData } from '../types/index.js';
export declare const createPaymentRedirectTool: Tool;
export declare class CreatePaymentRedirectHandler {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handle(args: unknown): Promise<{
        identifier: string;
        web_url: string;
        expires_at?: string;
        qr_web_url?: QrCodeData;
    }>;
    /**
     * Additional validation for input URLs
     */
    private validateInputUrls;
    /**
     * Validate that the tool response matches the expected schema
     */
    private validateResponse;
    /**
     * Extract domain from URL for logging purposes
     */
    private extractDomain;
    /**
     * Generate a tracking reference for the payment
     */
    private generateTrackingReference;
}
export declare function createPaymentRedirectHandler(paymentService: PaymentService): CreatePaymentRedirectHandler;
//# sourceMappingURL=create-payment-redirect.d.ts.map