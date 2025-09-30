interface LogContext {
    requestId?: string;
    tool?: string;
    operation?: string;
    duration?: number;
    [key: string]: unknown;
}
declare class DataMasker {
    private static readonly SENSITIVE_FIELDS;
    private static readonly PATTERNS;
    static maskObject(obj: unknown): unknown;
    static maskString(str: string): string;
    static maskAmount(amount: number | undefined, precision?: number): string;
}
declare class Logger {
    private winston;
    constructor();
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    toolCall(toolName: string, input: unknown, requestId?: string): void;
    toolResult(toolName: string, success: boolean, duration: number, requestId?: string): void;
    apiCall(method: string, url: string, duration?: number, statusCode?: number): void;
    paymentOperation(operation: string, paymentId: string, amount?: number, currency?: string): void;
    configLoaded(maskedConfig: Record<string, unknown>): void;
    serverStarted(serverName: string, tools: string[]): void;
}
export declare function getLogger(): Logger;
export declare function resetLogger(): void;
export { DataMasker };
//# sourceMappingURL=logger.d.ts.map