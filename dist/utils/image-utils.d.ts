export interface ImageProcessingOptions {
    size: number;
    includeBranding: boolean;
    style: 'basic' | 'branded';
    currencySymbol?: string;
    currencyImageUrl?: string;
    isGatewayUrl?: boolean;
    useCache?: boolean;
}
export interface ProcessedQrResult {
    buffer: Buffer;
    width: number;
    height: number;
}
/**
 * Generate optimized QR with logo - ULTRA FAST VERSION (~5.2ms total)
 */
export declare function generateOptimizedQrCode(data: string, options: ImageProcessingOptions): Promise<ProcessedQrResult>;
/**
 * Generate fast QR code (alias for compatibility) - ~5ms
 */
export declare function generateFastQrCode(data: string, size: number, errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'): Promise<Buffer>;
/**
 * Initialize fast image processing system
 */
export declare function initializeFastImageProcessing(): Promise<void>;
//# sourceMappingURL=image-utils.d.ts.map