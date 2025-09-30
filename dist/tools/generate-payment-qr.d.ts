import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PaymentService } from '../services/payment-service.js';
import type { CurrencyService } from '../services/currency-service.js';
import type { GeneratePaymentQrOutput } from '../types/index.js';
export declare const generatePaymentQrTool: Tool;
export declare class GeneratePaymentQrHandler {
    private readonly paymentService;
    private readonly currencyService;
    constructor(paymentService: PaymentService, currencyService: CurrencyService);
    handle(args: unknown): Promise<GeneratePaymentQrOutput>;
    /**
     * Validate input parameters
     */
    private validateInput;
    /**
     * Validate that the tool response matches the expected schema
     */
    private validateResponse;
    /**
     * Validate QR code data structure
     */
    private validateQrCodeData;
}
export declare function generatePaymentQrHandler(paymentService: PaymentService, currencyService: CurrencyService): GeneratePaymentQrHandler;
//# sourceMappingURL=generate-payment-qr.d.ts.map