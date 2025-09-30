export interface RequestLogContext {
    requestId: string;
    operation: string;
    startTime: number;
    toolName?: string;
    userId?: string;
}
export declare class RequestLogger {
    private static requestCounter;
    /**
     * Generate unique request ID
     */
    static generateRequestId(): string;
    /**
     * Log MCP tool request start
     */
    static logToolRequestStart(toolName: string, args?: unknown): RequestLogContext;
    /**
     * Log MCP tool request completion
     */
    static logToolRequestComplete(context: RequestLogContext, success: boolean, error?: unknown): void;
    /**
     * Log API request start
     */
    static logApiRequestStart(method: string, url: string, operation?: string): RequestLogContext;
    /**
     * Log API request completion
     */
    static logApiRequestComplete(context: RequestLogContext, statusCode: number, responseSize?: number, error?: unknown): void;
    /**
     * Mask sensitive information in URLs
     */
    private static maskSensitiveUrl;
}
export default RequestLogger;
//# sourceMappingURL=request-logger.d.ts.map