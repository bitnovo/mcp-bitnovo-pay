// MCP Bitnovo Pay Integration Server Entry Point

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration and utilities
import { getConfig, getMaskedConfig } from './config/index.js';
import { getLogger } from './utils/logger.js';
import { initializeQrCache, shutdownQrCache } from './utils/qr-cache.js';
import { initializeFastImageProcessing } from './utils/image-utils.js';
import { createMcpContentBlocks } from './utils/response-formatter.js';
import {
  initializeEventStore,
  shutdownEventStore,
} from './storage/webhook-events.js';
import {
  createWebhookServer,
  WebhookServer,
} from './webhook-server.js';
import type { WebhookConfiguration } from './types/index.js';

// API and services
import { createBitnovoApiClient } from './api/bitnovo-client.js';
import { PaymentService } from './services/payment-service.js';
import { CurrencyService } from './services/currency-service.js';

// MCP Tools
import {
  createPaymentOnchainTool,
  createPaymentOnchainHandler,
} from './tools/create-payment-onchain.js';
import {
  createPaymentLinkTool,
  createPaymentLinkHandler,
} from './tools/create-payment-link.js';
import {
  getPaymentStatusTool,
  getPaymentStatusHandler,
} from './tools/get-payment-status.js';
import {
  listCurrenciesCatalogTool,
  listCurrenciesCatalogHandler,
} from './tools/list-currencies-catalog.js';
import {
  generatePaymentQrTool,
  generatePaymentQrHandler,
} from './tools/generate-payment-qr.js';
import {
  getWebhookEventsTool,
  getWebhookEventsHandler,
} from './tools/get-webhook-events.js';
import {
  getWebhookUrlTool,
  getWebhookUrlHandler,
} from './tools/get-webhook-url.js';
import {
  getTunnelStatusTool,
  getTunnelStatusHandler,
} from './tools/get-tunnel-status.js';

const logger = getLogger();

class MCPBitnovoServer {
  private server: Server;
  private paymentService: PaymentService;
  private currencyService: CurrencyService;
  private webhookServer: WebhookServer | null = null;
  private config: ReturnType<typeof getConfig>;

  constructor() {
    // Initialize configuration
    this.config = getConfig();

    logger.info('Initializing MCP Bitnovo Pay Server', {
      config: getMaskedConfig(this.config),
      operation: 'server_init',
    });

    // Initialize performance optimization systems
    initializeQrCache({
      maxEntries: 1000,
      ttlMs: 60 * 60 * 1000, // 1 hour
    });

    // Initialize ultra-fast image processing
    initializeFastImageProcessing();

    // Initialize webhook infrastructure if enabled
    if (this.config.webhookEnabled) {
      this.initializeWebhookInfrastructure();
    }

    // Initialize API client and services
    const apiClient = createBitnovoApiClient(this.config);
    this.paymentService = new PaymentService(apiClient, this.config);
    this.currencyService = new CurrencyService(apiClient, this.config);

    // Initialize MCP Server
    this.server = new Server(
      {
        name: 'mcp-bitnovo-pay',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandlers();
  }

  /**
   * Initialize webhook infrastructure (event store and HTTP server)
   */
  private initializeWebhookInfrastructure(): void {
    logger.info('Initializing webhook infrastructure', {
      operation: 'webhook_infrastructure_init',
    });

    // Initialize event store
    const eventStoreConfig = {
      maxEntries: parseInt(process.env.WEBHOOK_MAX_EVENTS || '1000'),
      ttlMs: parseInt(process.env.WEBHOOK_EVENT_TTL_MS || '3600000'),
    };

    initializeEventStore(eventStoreConfig);

    // Create webhook server configuration
    const webhookConfig: WebhookConfiguration = {
      enabled: this.config.webhookEnabled || false,
      port: this.config.webhookPort || 3000,
      host: this.config.webhookHost || '0.0.0.0',
      path: this.config.webhookPath || '/webhook/bitnovo',
      maxEvents: eventStoreConfig.maxEntries,
      eventTtlMs: eventStoreConfig.ttlMs,
    };

    // Create webhook server
    this.webhookServer = createWebhookServer(this.config, webhookConfig);

    logger.info('Webhook infrastructure initialized', {
      webhookConfig,
      operation: 'webhook_infrastructure_ready',
    });
  }

  private setupToolHandlers(): void {
    // Register tool list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Listing available tools', { operation: 'list_tools' });

      // Base tools always available
      const tools = [
        createPaymentOnchainTool,
        createPaymentLinkTool,
        getPaymentStatusTool,
        listCurrenciesCatalogTool,
        generatePaymentQrTool,
      ];

      // Add webhook tools if webhooks are enabled
      if (this.config.webhookEnabled) {
        tools.push(getWebhookEventsTool);
        tools.push(getWebhookUrlTool);
        tools.push(getTunnelStatusTool);
      }

      return { tools };
    });

    // Register tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      logger.info('Tool call received', {
        toolName: name,
        operation: 'tool_call',
        timestamp: new Date().toISOString(),
      });

      try {
        switch (name) {
          case 'create_payment_onchain': {
            const handler = createPaymentOnchainHandler(
              this.paymentService,
              this.currencyService
            );
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'create_payment_onchain'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'create_payment_link': {
            const handler = createPaymentLinkHandler(this.paymentService);
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'create_payment_link'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'get_payment_status': {
            const handler = getPaymentStatusHandler(this.paymentService);
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'get_payment_status'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'list_currencies_catalog': {
            const handler = listCurrenciesCatalogHandler(this.currencyService);
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'list_currencies_catalog'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'generate_payment_qr': {
            const handler = generatePaymentQrHandler(
              this.paymentService,
              this.currencyService
            );
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'generate_payment_qr'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'get_webhook_events': {
            if (!this.config.webhookEnabled) {
              throw new Error(
                'Webhooks are not enabled. Set WEBHOOK_ENABLED=true to use this tool.'
              );
            }

            const handler = getWebhookEventsHandler();
            const result = await handler.handle(args);
            const contentBlocks = createMcpContentBlocks(
              result,
              'get_webhook_events'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'get_webhook_url': {
            if (!this.config.webhookEnabled) {
              throw new Error(
                'Webhooks are not enabled. Set WEBHOOK_ENABLED=true to use this tool.'
              );
            }

            const handler = getWebhookUrlHandler(this.webhookServer);
            const result = await handler.handle(args || {});
            const contentBlocks = createMcpContentBlocks(
              result,
              'get_webhook_url'
            );

            return {
              content: contentBlocks,
            };
          }

          case 'get_tunnel_status': {
            if (!this.config.webhookEnabled) {
              throw new Error(
                'Webhooks are not enabled. Set WEBHOOK_ENABLED=true to use this tool.'
              );
            }

            const handler = getTunnelStatusHandler(this.webhookServer);
            const result = await handler.handle({} as Record<string, never>);
            const contentBlocks = createMcpContentBlocks(
              result,
              'get_tunnel_status'
            );

            return {
              content: contentBlocks,
            };
          }

          default:
            logger.warn('Unknown tool requested', {
              toolName: name,
              operation: 'unknown_tool',
            });

            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error('Tool call failed', error as Error, {
          toolName: name,
          operation: 'tool_call_error',
        });

        // Return structured error response
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code || 'TOOL_ERROR';
        const statusCode = (error as any)?.statusCode || 500;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: {
                    code: errorCode,
                    message: errorMessage,
                    statusCode,
                    timestamp: new Date().toISOString(),
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', reason as Error, {
        operation: 'unhandled_rejection',
        promise: promise.toString(),
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      logger.error('Uncaught exception', error, {
        operation: 'uncaught_exception',
      });
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully', {
        operation: 'shutdown',
      });
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully', {
        operation: 'shutdown',
      });
      this.shutdown();
    });
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Starting graceful shutdown', {
        operation: 'shutdown_start',
      });

      // Stop webhook server if running
      if (this.webhookServer) {
        logger.info('Stopping webhook server', {
          operation: 'webhook_server_shutdown',
        });
        await this.webhookServer.stop();
      }

      // Shutdown webhook infrastructure
      if (this.config.webhookEnabled) {
        shutdownEventStore();
      }

      // Close server connections
      await this.server.close();

      // Clear service caches
      this.currencyService.clearCache();

      // Shutdown optimization systems
      shutdownQrCache();

      logger.info('Graceful shutdown completed', {
        operation: 'shutdown_complete',
      });

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error as Error, {
        operation: 'shutdown_error',
      });
      process.exit(1);
    }
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting MCP Bitnovo Pay Server', {
        operation: 'server_start',
      });

      // Start webhook server first (if enabled)
      if (this.webhookServer) {
        logger.info('Starting webhook server', {
          operation: 'webhook_server_start',
        });

        try {
          await this.webhookServer.start();
          logger.info('Webhook server started successfully', {
            port: this.config.webhookPort,
            host: this.config.webhookHost,
            path: this.config.webhookPath,
            operation: 'webhook_server_started',
          });
        } catch (error) {
          logger.error('Failed to start webhook server', error as Error, {
            operation: 'webhook_server_start_error',
          });
          // Continue anyway - webhooks are optional
          logger.warn(
            'Continuing without webhook server - MCP tools will still work',
            {
              operation: 'webhook_server_start_continue',
            }
          );
        }
      }

      // Validate service availability before starting - TEMPORARILY DISABLED due to infinite retry loop
      // const currencyAvailability = await this.currencyService.validateServiceAvailability();
      // if (!currencyAvailability.available) {
      //   logger.warn('Service availability check failed', {
      //     error: currencyAvailability.error,
      //     operation: 'availability_check'
      //   });
      // }

      // Connect MCP server to stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      const toolCount = this.config.webhookEnabled ? 8 : 5;

      logger.info('MCP Bitnovo Pay Server started successfully', {
        operation: 'server_started',
        availableTools: toolCount,
        serviceAvailable: 'unknown', // Disabled during debugging
        webhooksEnabled: this.config.webhookEnabled,
        optimizations: {
          qrCache: 'enabled',
          fastQrGeneration: 'enabled',
          dynamicCryptoLogos: 'enabled',
        },
      });
    } catch (error) {
      logger.error('Failed to start server', error as Error, {
        operation: 'server_start_error',
      });
      throw error;
    }
  }

  getServer(): Server {
    return this.server;
  }
}

// Start the server when this module is run directly
async function main(): Promise<void> {
  try {
    const server = new MCPBitnovoServer();
    await server.start();

    logger.info('MCP Bitnovo Pay Server is running', {
      operation: 'main_start',
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    logger.error('Server startup failed', error as Error, {
      operation: 'main_error',
    });
    process.exit(1);
  }
}

// Only run main if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(() => {
    // Don't use console.error in MCP mode as it breaks the JSON protocol
    // Error is already logged by the logger in the main function
    process.exit(1);
  });
}

export { MCPBitnovoServer };
export default MCPBitnovoServer;
