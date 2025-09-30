export interface WebhookEvent {
    /** Unique payment identifier */
    identifier: string;
    /** Payment status from webhook */
    status: string;
    /** Timestamp when webhook was received */
    receivedAt: Date;
    /** Full webhook payload */
    payload: Record<string, unknown>;
    /** HMAC signature from X-SIGNATURE header */
    signature: string;
    /** Nonce from X-NONCE header */
    nonce: string;
    /** Whether signature validation passed */
    validated: boolean;
    /** Event ID for deduplication */
    eventId: string;
}
export interface EventStoreConfig {
    /** Maximum number of events to store */
    maxEntries: number;
    /** Time-to-live for events in milliseconds */
    ttlMs: number;
}
/**
 * In-memory event store for webhook notifications
 * Features:
 * - Automatic cleanup of expired events
 * - Event deduplication by eventId
 * - Fast lookup by payment identifier
 * - Memory-bounded with configurable limits
 */
export declare class WebhookEventStore {
    private events;
    private eventsByIdentifier;
    private config;
    private cleanupInterval;
    constructor(config: EventStoreConfig);
    /**
     * Store a webhook event
     * @param event - The webhook event to store
     * @returns true if stored successfully, false if duplicate or storage full
     */
    store(event: WebhookEvent): boolean;
    /**
     * Get all events for a specific payment identifier
     * @param identifier - The payment identifier
     * @returns Array of webhook events, sorted by receivedAt (newest first)
     */
    getByIdentifier(identifier: string): WebhookEvent[];
    /**
     * Get most recent webhook events
     * @param limit - Maximum number of events to return
     * @returns Array of webhook events, sorted by receivedAt (newest first)
     */
    getRecent(limit?: number): WebhookEvent[];
    /**
     * Get a specific event by eventId
     * @param eventId - The event ID
     * @returns The webhook event or undefined if not found
     */
    getByEventId(eventId: string): WebhookEvent | undefined;
    /**
     * Get all validated events (signature verification passed)
     * @param limit - Maximum number of events to return
     * @returns Array of validated webhook events
     */
    getValidated(limit?: number): WebhookEvent[];
    /**
     * Remove expired events based on TTL
     * @returns Number of events removed
     */
    cleanup(): number;
    /**
     * Remove oldest events to free up space
     * @param count - Number of events to remove
     */
    private removeOldestEvents;
    /**
     * Remove a single event from the store
     * @param eventId - The event ID to remove
     */
    private removeEvent;
    /**
     * Start automatic cleanup task
     */
    private startCleanupTask;
    /**
     * Stop automatic cleanup task
     */
    stopCleanupTask(): void;
    /**
     * Clear all events from the store
     */
    clear(): void;
    /**
     * Get store statistics
     */
    getStats(): {
        totalEvents: number;
        uniqueIdentifiers: number;
        oldestEventAge: number | null;
        newestEventAge: number | null;
        validatedCount: number;
        invalidatedCount: number;
    };
    /**
     * Get current configuration
     */
    getConfig(): EventStoreConfig;
    /**
     * Update configuration (requires restart of cleanup task)
     */
    updateConfig(config: Partial<EventStoreConfig>): void;
}
/**
 * Initialize the global event store
 * @param config - Event store configuration
 */
export declare function initializeEventStore(config: EventStoreConfig): void;
/**
 * Get the global event store instance
 * @throws Error if not initialized
 */
export declare function getEventStore(): WebhookEventStore;
/**
 * Shutdown the event store (stop cleanup tasks)
 */
export declare function shutdownEventStore(): void;
//# sourceMappingURL=webhook-events.d.ts.map