import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { GetWebhookUrlInput, GetWebhookUrlOutput } from '../types/index.js';
import type { WebhookServer } from '../webhook-server.js';
/**
 * MCP Tool Definition: get_webhook_url
 */
export declare const getWebhookUrlTool: Tool;
/**
 * Handler for get_webhook_url tool
 */
export declare class GetWebhookUrlHandler {
    private webhookServer;
    constructor(webhookServer: WebhookServer | null);
    handle(args: GetWebhookUrlInput): Promise<GetWebhookUrlOutput>;
}
/**
 * Factory function to create handler with webhook server reference
 */
export declare function getWebhookUrlHandler(webhookServer: WebhookServer | null): GetWebhookUrlHandler;
//# sourceMappingURL=get-webhook-url.d.ts.map