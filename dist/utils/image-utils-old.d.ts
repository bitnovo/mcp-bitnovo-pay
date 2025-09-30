import { type PreloadedAsset } from './asset-preloader.js';
export interface ImageProcessingOptions {
    logoUrl?: string;
    size: number;
    includeBranding: boolean;
    style: 'basic' | 'branded';
    currencySymbol?: string;
    isGatewayUrl?: boolean;
    useCache?: boolean;
}
export interface ProcessedQrResult {
    buffer: Buffer;
    width: number;
    height: number;
}
/**
 * Download and cache an image from URL (fallback for non-preloaded assets)
 */
export declare function downloadImage(url: string): Promise<Buffer>;
/**
 * Generate fast QR code using qr-image (much faster than qrcode library)
 */
export declare function generateFastQrCode(data: string, size: number, errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'): Buffer;
/**
 * Fast logo overlay using Sharp composite operations
 */
export declare function overlayLogoOnQr(qrBuffer: Buffer, logoAsset: PreloadedAsset, qrSize: number): Promise<Buffer>;
/**
 * Fast branding addition using Sharp text and SVG operations
 */
export declare function addBitnovoBranding(qrBuffer: Buffer, qrSize: number, currencySymbol?: string): Promise<ProcessedQrResult>;
/**
 * High-performance QR code processing with caching
 */
export declare function processQrCode(qrBuffer: Buffer, options: ImageProcessingOptions): Promise<ProcessedQrResult>;
/**
 * Generate optimized QR code with all enhancements
 */
export declare function generateOptimizedQrCode(data: string, options: ImageProcessingOptions): Promise<ProcessedQrResult>;
/**
 * Clear the image cache (useful for testing or memory management)
 */
export declare function clearImageCache(): void;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): {
    entries: number;
    totalSize: number;
};
/**
 * Backward compatibility function - download Bitnovo logo
 */
export declare function downloadBitnovoLogo(): Promise<Buffer>;
//# sourceMappingURL=image-utils-old.d.ts.map