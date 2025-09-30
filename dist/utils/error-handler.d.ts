export interface ErrorDetails {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
    timestamp: string;
    operation?: string;
}
export interface ValidationErrorDetail {
    field?: string;
    message: string;
    code: string;
}
export declare class MCPError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    readonly operation?: string;
    constructor(message: string, statusCode: number, code: string, details?: unknown, operation?: string);
}
export declare class ValidationError extends MCPError {
    constructor(message: string, field?: string, code?: string);
}
export declare class AuthenticationError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class AuthorizationError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class NotFoundError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class ConflictError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class RateLimitError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class ServiceUnavailableError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class TimeoutError extends MCPError {
    constructor(message?: string, details?: unknown);
}
export declare class InternalServerError extends MCPError {
    constructor(message?: string, details?: unknown);
}
/**
 * Error handler class for processing and formatting errors
 */
export declare class ErrorHandler {
    /**
     * Process error and return structured error details
     */
    static processError(error: unknown, operation?: string): ErrorDetails;
    /**
     * Format error for MCP response
     */
    static formatMCPError(error: unknown, operation?: string): {
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError: true;
    };
    /**
     * Check if error is retryable
     */
    static isRetryableError(error: unknown): boolean;
    /**
     * Get HTTP status code from error
     */
    static getStatusCode(error: unknown): number;
    /**
     * Create error response for different contexts
     */
    static createErrorResponse(error: unknown, context: 'mcp' | 'api' | 'log', operation?: string): any;
    /**
     * Sanitize error details for client response (remove sensitive information)
     */
    static sanitizeErrorForClient(errorDetails: ErrorDetails): ErrorDetails;
}
/**
 * Utility functions for common error scenarios
 */
export declare function createValidationError(message: string, field?: string): ValidationError;
export declare function createNotFoundError(resource: string, identifier?: string): NotFoundError;
export declare function createTimeoutError(operation: string, timeout: number): TimeoutError;
export declare function createServiceUnavailableError(service: string, reason?: string): ServiceUnavailableError;
export declare const processError: typeof ErrorHandler.processError, formatMCPError: typeof ErrorHandler.formatMCPError, isRetryableError: typeof ErrorHandler.isRetryableError, getStatusCode: typeof ErrorHandler.getStatusCode;
//# sourceMappingURL=error-handler.d.ts.map