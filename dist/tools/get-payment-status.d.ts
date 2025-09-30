import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { PaymentService } from '../services/payment-service.js';
export declare const getPaymentStatusTool: Tool;
export declare class GetPaymentStatusHandler {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handle(args: unknown): Promise<{
        identifier: string;
        status: string;
        status_description?: string;
        confirmed_amount?: number;
        unconfirmed_amount?: number;
        crypto_amount?: number;
        remaining_amount?: number;
        expired_time?: string;
        network_fee?: number;
        exchange_rate?: number;
        requires_action?: boolean;
        is_expired?: boolean;
        is_completed?: boolean;
        is_failed?: boolean;
    }>;
    /**
     * Get human-readable status description with actionable information
     */
    private getStatusGuidance;
    /**
     * Calculate progress percentage for the payment
     */
    private calculateProgress;
    /**
     * Determine if the payment status should trigger notifications
     */
    private shouldNotify;
    /**
     * Get next recommended action for the payment status
     */
    private getNextAction;
    /**
     * Validate that the tool response matches the expected schema
     */
    private validateResponse;
    /**
     * Mask sensitive information in payment status for logging
     */
    private maskSensitiveData;
}
export declare function getPaymentStatusHandler(paymentService: PaymentService): GetPaymentStatusHandler;
//# sourceMappingURL=get-payment-status.d.ts.map