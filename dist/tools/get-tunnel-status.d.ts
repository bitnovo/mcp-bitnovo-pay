import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { GetTunnelStatusOutput } from '../types/index.js';
import type { WebhookServer } from '../webhook-server.js';
/**
 * MCP Tool Definition: get_tunnel_status
 */
export declare const getTunnelStatusTool: Tool;
/**
 * Handler for get_tunnel_status tool
 */
export declare class GetTunnelStatusHandler {
    private webhookServer;
    constructor(webhookServer: WebhookServer | null);
    handle(_args: Record<string, never>): Promise<GetTunnelStatusOutput>;
}
/**
 * Factory function to create handler with webhook server reference
 */
export declare function getTunnelStatusHandler(webhookServer: WebhookServer | null): GetTunnelStatusHandler;
//# sourceMappingURL=get-tunnel-status.d.ts.map