// HTTP webhook server for receiving Bitnovo Pay notifications
// Runs alongside the MCP stdio server to handle incoming webhooks
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getLogger } from './utils/logger.js';
import { createWebhookHandler } from './webhook-handler.js';
import { getEventStore } from './storage/webhook-events.js';
import { TunnelManager } from './tunnel/tunnel-manager.js';
import { detectContext, getRecommendedTunnelConfig } from './tunnel/context-detector.js';
const logger = getLogger();
/**
 * Express middleware for raw body capture
 * Required for HMAC signature validation
 */
function rawBodyMiddleware(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}
/**
 * HTTP webhook server
 * Receives POST requests from Bitnovo Pay API with payment status updates
 */
export class WebhookServer {
    app;
    server = null;
    config;
    mcpConfig;
    webhookHandler;
    tunnelManager = null;
    publicUrl = null;
    constructor(config, webhookConfig) {
        this.config = webhookConfig;
        this.mcpConfig = config;
        this.webhookHandler = createWebhookHandler(config);
        this.app = express();
        // Initialize tunnel manager if enabled
        if (config.tunnelEnabled && config.webhookEnabled) {
            this.initializeTunnelManager();
        }
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandlers();
        logger.info('Webhook server initialized', {
            enabled: webhookConfig.enabled,
            host: webhookConfig.host,
            port: webhookConfig.port,
            path: webhookConfig.path,
            tunnelEnabled: config.tunnelEnabled,
            operation: 'webhook_server_init',
        });
    }
    /**
     * Initialize tunnel manager based on configuration and context detection
     */
    initializeTunnelManager() {
        // Auto-detect execution context
        const contextResult = detectContext();
        const recommended = getRecommendedTunnelConfig(contextResult);
        logger.info('Execution context detected', {
            context: contextResult.context,
            confidence: contextResult.confidence,
            suggestedProvider: recommended.provider,
            reason: recommended.reason,
            operation: 'context_detection',
        });
        // Use explicit configuration if provided, otherwise use detected recommendation
        const provider = (this.mcpConfig.tunnelProvider || recommended.provider);
        const publicUrl = this.mcpConfig.tunnelPublicUrl || recommended.publicUrl;
        const tunnelConfig = {
            enabled: this.mcpConfig.tunnelEnabled || true,
            provider,
            localPort: this.config.port,
            publicUrl,
            ngrokAuthToken: this.mcpConfig.ngrokAuthToken,
            ngrokDomain: this.mcpConfig.ngrokDomain,
            zrokToken: this.mcpConfig.zrokToken,
            zrokUniqueName: this.mcpConfig.zrokUniqueName,
            healthCheckInterval: this.mcpConfig.tunnelHealthCheckInterval || 60000,
            reconnectMaxRetries: this.mcpConfig.tunnelReconnectMaxRetries || 10,
            reconnectBackoffMs: this.mcpConfig.tunnelReconnectBackoffMs || 5000,
        };
        this.tunnelManager = new TunnelManager(tunnelConfig);
        logger.info('Tunnel manager initialized', {
            provider,
            localPort: tunnelConfig.localPort,
            publicUrl: publicUrl || 'auto',
            operation: 'tunnel_manager_init',
        });
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Security headers with Helmet
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                },
            },
        }));
        // CORS configuration - restrictive for production
        const corsOptions = {
            origin: (origin, callback) => {
                // Allow Bitnovo domains
                const allowedOrigins = [
                    'https://pos.bitnovo.com',
                    'https://dev-payments.pre-bnvo.com',
                    'https://pay.bitnovo.com',
                    'https://paytest.bitnovo.com',
                ];
                // Allow requests with no origin (like Postman) in development
                if (!origin ||
                    allowedOrigins.some(allowed => origin.startsWith(allowed))) {
                    callback(null, true);
                }
                else {
                    logger.warn('CORS blocked request from origin', {
                        origin,
                        operation: 'webhook_cors_blocked',
                    });
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['POST'],
            allowedHeaders: ['Content-Type', 'X-NONCE', 'X-SIGNATURE'],
            maxAge: 600, // 10 minutes
        };
        this.app.use(cors(corsOptions));
        // JSON body parser with raw body capture for HMAC validation
        this.app.use(express.json({
            limit: '1mb',
            verify: rawBodyMiddleware,
        }));
        // Request logging middleware
        this.app.use((req, res, next) => {
            const requestId = Math.random().toString(36).substring(2, 15);
            req.requestId = requestId;
            logger.debug('Webhook request received', {
                requestId,
                method: req.method,
                path: req.path,
                origin: req.get('origin'),
                operation: 'webhook_request',
            });
            next();
        });
    }
    /**
     * Setup Express routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const stats = getEventStore().getStats();
            const handlerStats = this.webhookHandler.getStats();
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                webhook: {
                    enabled: this.config.enabled,
                    path: this.config.path,
                },
                eventStore: {
                    totalEvents: stats.totalEvents,
                    uniqueIdentifiers: stats.uniqueIdentifiers,
                    validatedCount: stats.validatedCount,
                    invalidatedCount: stats.invalidatedCount,
                },
                handler: {
                    noncesCached: handlerStats.noncesCached,
                    hasDeviceSecret: handlerStats.hasDeviceSecret,
                },
            });
        });
        // Main webhook endpoint
        this.app.post(this.config.path, async (req, res, next) => {
            const requestId = req.requestId;
            const startTime = Date.now();
            try {
                // Prepare webhook request for handler
                const webhookRequest = {
                    headers: {
                        'x-nonce': req.get('x-nonce'),
                        'x-signature': req.get('x-signature'),
                    },
                    body: req.body,
                    rawBody: req.rawBody || JSON.stringify(req.body),
                };
                // Process webhook
                const result = await this.webhookHandler.handle(webhookRequest);
                const duration = Date.now() - startTime;
                if (result.success) {
                    logger.info('Webhook processed successfully', {
                        requestId,
                        eventId: result.eventId,
                        duration,
                        operation: 'webhook_success',
                    });
                    res.status(result.statusCode).json({
                        success: true,
                        eventId: result.eventId,
                        timestamp: new Date().toISOString(),
                    });
                }
                else {
                    logger.warn('Webhook processing failed', {
                        requestId,
                        error: result.error,
                        errorCode: result.errorCode,
                        duration,
                        operation: 'webhook_failed',
                    });
                    res.status(result.statusCode).json({
                        success: false,
                        error: result.error,
                        errorCode: result.errorCode,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
        // Stats endpoint (optional, can be disabled in production)
        this.app.get('/stats', (req, res) => {
            const stats = getEventStore().getStats();
            const handlerStats = this.webhookHandler.getStats();
            res.status(200).json({
                eventStore: stats,
                handler: handlerStats,
                config: {
                    maxEvents: this.config.maxEvents,
                    eventTtlMs: this.config.eventTtlMs,
                    path: this.config.path,
                },
            });
        });
        // 404 handler for undefined routes
        this.app.use((req, res) => {
            logger.warn('Webhook 404 - Route not found', {
                method: req.method,
                path: req.path,
                operation: 'webhook_404',
            });
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`,
                availableEndpoints: [
                    `POST ${this.config.path}`,
                    'GET /health',
                    'GET /stats',
                ],
            });
        });
    }
    /**
     * Setup error handlers
     */
    setupErrorHandlers() {
        // Global error handler
        this.app.use((error, req, res, next // eslint-disable-line @typescript-eslint/no-unused-vars
        ) => {
            const requestId = req.requestId;
            logger.error('Webhook server error', error, {
                requestId,
                method: req.method,
                path: req.path,
                operation: 'webhook_server_error',
            });
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An error occurred processing the webhook',
                requestId,
                timestamp: new Date().toISOString(),
            });
        });
    }
    /**
     * Start the webhook server (and tunnel if configured)
     */
    async start() {
        if (!this.config.enabled) {
            logger.info('Webhook server disabled, skipping startup', {
                operation: 'webhook_server_disabled',
            });
            return;
        }
        if (this.server) {
            logger.warn('Webhook server already running', {
                operation: 'webhook_server_already_running',
            });
            return;
        }
        // Start HTTP server first
        await new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.port, this.config.host, () => {
                    logger.info('Webhook server started successfully', {
                        host: this.config.host,
                        port: this.config.port,
                        path: this.config.path,
                        url: `http://${this.config.host}:${this.config.port}${this.config.path}`,
                        operation: 'webhook_server_started',
                    });
                    resolve();
                });
                this.server.on('error', (error) => {
                    logger.error('Webhook server startup error', error, {
                        operation: 'webhook_server_startup_error',
                    });
                    reject(error);
                });
            }
            catch (error) {
                logger.error('Failed to start webhook server', error, {
                    operation: 'webhook_server_start_failed',
                });
                reject(error);
            }
        });
        // Start tunnel if configured
        if (this.tunnelManager) {
            try {
                logger.info('Starting tunnel...', {
                    operation: 'tunnel_start',
                });
                this.publicUrl = await this.tunnelManager.start();
                logger.info('Tunnel started successfully', {
                    publicUrl: this.publicUrl,
                    webhookUrl: `${this.publicUrl}${this.config.path}`,
                    operation: 'tunnel_started',
                });
            }
            catch (error) {
                logger.error('Failed to start tunnel', error, {
                    operation: 'tunnel_start_failed',
                });
                // Continue without tunnel - local HTTP server is still accessible
                logger.warn('Continuing without tunnel - webhooks available locally only', {
                    operation: 'tunnel_start_continue',
                });
            }
        }
    }
    /**
     * Stop the webhook server (and tunnel if running)
     */
    async stop() {
        // Stop tunnel first
        if (this.tunnelManager) {
            try {
                await this.tunnelManager.stop();
                logger.info('Tunnel stopped', {
                    operation: 'tunnel_stopped',
                });
                this.publicUrl = null;
            }
            catch (error) {
                logger.error('Error stopping tunnel', error, {
                    operation: 'tunnel_stop_error',
                });
            }
        }
        // Then stop HTTP server
        if (!this.server) {
            logger.debug('Webhook server not running, nothing to stop', {
                operation: 'webhook_server_not_running',
            });
            return;
        }
        return new Promise((resolve, reject) => {
            this.server.close(error => {
                if (error) {
                    logger.error('Error stopping webhook server', error, {
                        operation: 'webhook_server_stop_error',
                    });
                    reject(error);
                }
                else {
                    logger.info('Webhook server stopped', {
                        operation: 'webhook_server_stopped',
                    });
                    this.server = null;
                    resolve();
                }
            });
        });
    }
    /**
     * Check if server is running
     */
    isRunning() {
        return this.server !== null;
    }
    /**
     * Get server configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get Express app instance (for testing)
     */
    getApp() {
        return this.app;
    }
    /**
     * Get tunnel manager instance
     */
    getTunnelManager() {
        return this.tunnelManager;
    }
    /**
     * Get public webhook URL (from tunnel or manual config)
     */
    getPublicUrl() {
        return this.publicUrl;
    }
    /**
     * Get full webhook URL (public URL + path)
     */
    getWebhookUrl() {
        if (!this.publicUrl) {
            return null;
        }
        return `${this.publicUrl}${this.config.path}`;
    }
}
/**
 * Create a webhook server instance
 * @param config - MCP server configuration
 * @param webhookConfig - Webhook server configuration
 * @returns WebhookServer instance
 */
export function createWebhookServer(config, webhookConfig) {
    return new WebhookServer(config, webhookConfig);
}
//# sourceMappingURL=webhook-server.js.map