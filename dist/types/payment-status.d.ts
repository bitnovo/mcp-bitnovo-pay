import type { PaymentStatusCode } from './index.js';
export declare const PaymentStatus: {
    readonly NR: "NR";
    readonly PE: "PE";
    readonly AC: "AC";
    readonly IA: "IA";
    readonly OC: "OC";
    readonly CO: "CO";
    readonly CA: "CA";
    readonly EX: "EX";
    readonly FA: "FA";
};
export interface PaymentStatusInfo {
    code: PaymentStatusCode;
    name: string;
    description: string;
    userMessage: string;
    actionRequired: string;
    isTerminal: boolean;
    isSuccessful: boolean;
}
export declare const PaymentStatusMap: Record<PaymentStatusCode, PaymentStatusInfo>;
export declare function getPaymentStatusInfo(status: PaymentStatusCode): PaymentStatusInfo;
export declare function isTerminalStatus(status: PaymentStatusCode): boolean;
export declare function isSuccessfulStatus(status: PaymentStatusCode): boolean;
export declare function requiresUserAction(status: PaymentStatusCode): boolean;
export declare function canTransitionTo(fromStatus: PaymentStatusCode, toStatus: PaymentStatusCode): boolean;
export declare function getStatusPriority(status: PaymentStatusCode): number;
//# sourceMappingURL=payment-status.d.ts.map