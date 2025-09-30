import type { QrCodeData } from '../types/index.js';
/**
 * MCP Content Block types
 */
interface TextContentBlock {
    type: 'text';
    text: string;
}
interface ImageContentBlock {
    type: 'image';
    data: string;
    mimeType: string;
}
export type ContentBlock = TextContentBlock | ImageContentBlock;
interface PaymentResponse {
    identifier: string;
    address?: string;
    payment_uri?: string;
    web_url?: string;
    qr_address?: QrCodeData;
    qr_payment_uri?: QrCodeData;
    qr_web_url?: QrCodeData;
    qr_gateway_url?: QrCodeData;
    [key: string]: any;
}
/**
 * Format payment response for Claude Desktop
 * Makes responses more readable by summarizing large data
 */
export declare function formatPaymentResponse(response: PaymentResponse): any;
/**
 * Format any response with potential large data
 */
export declare function formatMcpResponse(response: any): any;
/**
 * Extract QR codes from response and convert to image content blocks
 */
export declare function extractQrImages(response: any): ImageContentBlock[];
/**
 * Create content blocks for MCP response with separate image blocks
 */
export declare function createMcpContentBlocks(response: any, toolName: string): ContentBlock[];
/**
 * Create a user-friendly summary for Claude Desktop
 */
export declare function createResponseSummary(response: any, toolName: string): string;
export {};
//# sourceMappingURL=response-formatter.d.ts.map