import { Express } from 'express';
import type { Configuration, WebhookConfiguration } from './types/index.js';
import { TunnelManager } from './tunnel/tunnel-manager.js';
/**
 * HTTP webhook server
 * Receives POST requests from Bitnovo Pay API with payment status updates
 */
export declare class WebhookServer {
    private app;
    private server;
    private config;
    private mcpConfig;
    private webhookHandler;
    private tunnelManager;
    publicUrl: string | null;
    constructor(config: Configuration, webhookConfig: WebhookConfiguration);
    /**
     * Initialize tunnel manager based on configuration and context detection
     */
    private initializeTunnelManager;
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup Express routes
     */
    private setupRoutes;
    /**
     * Setup error handlers
     */
    private setupErrorHandlers;
    /**
     * Start the webhook server (and tunnel if configured)
     */
    start(): Promise<void>;
    /**
     * Stop the webhook server (and tunnel if running)
     */
    stop(): Promise<void>;
    /**
     * Check if server is running
     */
    isRunning(): boolean;
    /**
     * Get server configuration
     */
    getConfig(): WebhookConfiguration;
    /**
     * Get Express app instance (for testing)
     */
    getApp(): Express;
    /**
     * Get tunnel manager instance
     */
    getTunnelManager(): TunnelManager | null;
    /**
     * Get public webhook URL (from tunnel or manual config)
     */
    getPublicUrl(): string | null;
    /**
     * Get full webhook URL (public URL + path)
     */
    getWebhookUrl(): string | null;
}
/**
 * Create a webhook server instance
 * @param config - MCP server configuration
 * @param webhookConfig - Webhook server configuration
 * @returns WebhookServer instance
 */
export declare function createWebhookServer(config: Configuration, webhookConfig: WebhookConfiguration): WebhookServer;
//# sourceMappingURL=webhook-server.d.ts.map