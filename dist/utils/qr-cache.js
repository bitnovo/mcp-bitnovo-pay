// High-performance QR code cache with LRU eviction policy
import { getLogger } from './logger.js';
const logger = getLogger();
export class QrCache {
    cache = new Map();
    accessOrder = []; // For LRU tracking
    cleanupTimer;
    options;
    constructor(options = {}) {
        this.options = {
            maxEntries: options.maxEntries ?? 500, // Store up to 500 QRs
            ttlMs: options.ttlMs ?? 60 * 60 * 1000, // 1 hour TTL (payment expiry)
            cleanupIntervalMs: options.cleanupIntervalMs ?? 10 * 60 * 1000, // Cleanup every 10 minutes
        };
        this.startCleanupTimer();
        logger.info('QR cache initialized', {
            maxEntries: this.options.maxEntries,
            ttlMs: this.options.ttlMs,
            operation: 'qr_cache_init',
        });
    }
    /**
     * Generate cache key for QR code
     */
    generateKey(identifier, qrType, size, style, branding) {
        return `${identifier}-${qrType}-${size}-${style}-${branding}`;
    }
    /**
     * Get QR from cache
     */
    get(identifier, qrType, size, style, branding) {
        const key = this.generateKey(identifier, qrType, size, style, branding);
        const entry = this.cache.get(key);
        if (!entry) {
            logger.debug('QR cache miss', { key, operation: 'qr_cache_miss' });
            return null;
        }
        const now = Date.now();
        // Check if entry has expired
        if (now - entry.timestamp > this.options.ttlMs) {
            logger.debug('QR cache entry expired', {
                key,
                age: now - entry.timestamp,
                operation: 'qr_cache_expired',
            });
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }
        // Update access tracking
        entry.accessCount++;
        entry.lastAccessed = now;
        this.updateAccessOrder(key);
        logger.debug('QR cache hit', {
            key,
            accessCount: entry.accessCount,
            operation: 'qr_cache_hit',
        });
        return entry.data;
    }
    /**
     * Store QR in cache
     */
    set(identifier, qrType, size, style, branding, qrData) {
        const key = this.generateKey(identifier, qrType, size, style, branding);
        const now = Date.now();
        // If cache is full, remove least recently used entry
        if (this.cache.size >= this.options.maxEntries && !this.cache.has(key)) {
            this.evictLRU();
        }
        const entry = {
            data: qrData,
            timestamp: now,
            accessCount: 1,
            lastAccessed: now,
        };
        this.cache.set(key, entry);
        this.updateAccessOrder(key);
        logger.debug('QR cached', {
            key,
            cacheSize: this.cache.size,
            operation: 'qr_cache_set',
        });
    }
    /**
     * Update access order for LRU tracking
     */
    updateAccessOrder(key) {
        // Remove from current position
        this.removeFromAccessOrder(key);
        // Add to end (most recently used)
        this.accessOrder.push(key);
    }
    /**
     * Remove key from access order array
     */
    removeFromAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    /**
     * Evict least recently used entry
     */
    evictLRU() {
        if (this.accessOrder.length === 0)
            return;
        const lruKey = this.accessOrder[0];
        if (lruKey) {
            this.cache.delete(lruKey);
            this.accessOrder.shift();
            logger.debug('QR cache LRU eviction', {
                evictedKey: lruKey,
                cacheSize: this.cache.size,
                operation: 'qr_cache_evict',
            });
        }
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let expiredCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.options.ttlMs) {
                this.cache.delete(key);
                this.removeFromAccessOrder(key);
                expiredCount++;
            }
        }
        if (expiredCount > 0) {
            logger.debug('QR cache cleanup completed', {
                expiredCount,
                remainingEntries: this.cache.size,
                operation: 'qr_cache_cleanup',
            });
        }
    }
    /**
     * Start periodic cleanup timer
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.options.cleanupIntervalMs);
    }
    /**
     * Get cache statistics
     */
    getStats() {
        let totalAccesses = 0;
        let hits = 0;
        let oldestTimestamp = Date.now();
        let memoryUsage = 0;
        for (const entry of this.cache.values()) {
            totalAccesses += entry.accessCount;
            if (entry.accessCount > 1) {
                hits += entry.accessCount - 1; // First access is not a hit
            }
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
            }
            // Rough memory calculation (base64 string + metadata)
            memoryUsage += entry.data.data.length + 200;
        }
        return {
            size: this.cache.size,
            maxSize: this.options.maxEntries,
            hitRate: totalAccesses > 0 ? hits / totalAccesses : 0,
            oldestEntryAge: Date.now() - oldestTimestamp,
            memoryUsage,
        };
    }
    /**
     * Clear all entries
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
        logger.info('QR cache cleared', { operation: 'qr_cache_clear' });
    }
    /**
     * Gracefully shutdown cache
     */
    shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.clear();
        logger.info('QR cache shutdown', { operation: 'qr_cache_shutdown' });
    }
    /**
     * Check if cache contains a specific QR
     */
    has(identifier, qrType, size, style, branding) {
        const key = this.generateKey(identifier, qrType, size, style, branding);
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        // Check if expired
        const now = Date.now();
        if (now - entry.timestamp > this.options.ttlMs) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return false;
        }
        return true;
    }
    /**
     * Preload QR codes for common scenarios
     */
    async preload(commonScenarios) {
        for (const scenario of commonScenarios) {
            this.set(scenario.identifier, scenario.qrType, scenario.size, scenario.style, scenario.branding, scenario.qrData);
        }
        logger.info('QR cache preload completed', {
            preloadedCount: commonScenarios.length,
            operation: 'qr_cache_preload',
        });
    }
}
// Global QR cache instance
let globalQrCache = null;
/**
 * Get or create global QR cache instance
 */
export function getQrCache() {
    if (!globalQrCache) {
        globalQrCache = new QrCache();
    }
    return globalQrCache;
}
/**
 * Initialize QR cache with custom options
 */
export function initializeQrCache(options = {}) {
    if (globalQrCache) {
        globalQrCache.shutdown();
    }
    globalQrCache = new QrCache(options);
    return globalQrCache;
}
/**
 * Shutdown global QR cache
 */
export function shutdownQrCache() {
    if (globalQrCache) {
        globalQrCache.shutdown();
        globalQrCache = null;
    }
}
//# sourceMappingURL=qr-cache.js.map