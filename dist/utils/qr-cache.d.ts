import type { QrCodeData } from '../types/index.js';
export interface QrCacheEntry {
    data: QrCodeData;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}
export interface QrCacheOptions {
    maxEntries: number;
    ttlMs: number;
    cleanupIntervalMs: number;
}
export declare class QrCache {
    private cache;
    private accessOrder;
    private cleanupTimer?;
    private readonly options;
    constructor(options?: Partial<QrCacheOptions>);
    /**
     * Generate cache key for QR code
     */
    private generateKey;
    /**
     * Get QR from cache
     */
    get(identifier: string, qrType: string, size: number, style: string, branding: boolean): QrCodeData | null;
    /**
     * Store QR in cache
     */
    set(identifier: string, qrType: string, size: number, style: string, branding: boolean, qrData: QrCodeData): void;
    /**
     * Update access order for LRU tracking
     */
    private updateAccessOrder;
    /**
     * Remove key from access order array
     */
    private removeFromAccessOrder;
    /**
     * Evict least recently used entry
     */
    private evictLRU;
    /**
     * Clean up expired entries
     */
    private cleanup;
    /**
     * Start periodic cleanup timer
     */
    private startCleanupTimer;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        oldestEntryAge: number;
        memoryUsage: number;
    };
    /**
     * Clear all entries
     */
    clear(): void;
    /**
     * Gracefully shutdown cache
     */
    shutdown(): void;
    /**
     * Check if cache contains a specific QR
     */
    has(identifier: string, qrType: string, size: number, style: string, branding: boolean): boolean;
    /**
     * Preload QR codes for common scenarios
     */
    preload(commonScenarios: Array<{
        identifier: string;
        qrType: string;
        size: number;
        style: string;
        branding: boolean;
        qrData: QrCodeData;
    }>): Promise<void>;
}
/**
 * Get or create global QR cache instance
 */
export declare function getQrCache(): QrCache;
/**
 * Initialize QR cache with custom options
 */
export declare function initializeQrCache(options?: Partial<QrCacheOptions>): QrCache;
/**
 * Shutdown global QR cache
 */
export declare function shutdownQrCache(): void;
//# sourceMappingURL=qr-cache.d.ts.map