import type { GetWebhookEventsOutput } from '../types/index.js';
/**
 * Tool definition for MCP
 */
export declare const getWebhookEventsTool: {
    readonly name: "get_webhook_events";
    readonly description: string;
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly identifier: {
                readonly type: "string";
                readonly description: string;
            };
            readonly limit: {
                readonly type: "number";
                readonly description: "Maximum number of events to return (default: 50, max: 500)";
                readonly minimum: 1;
                readonly maximum: 500;
            };
            readonly validated_only: {
                readonly type: "boolean";
                readonly description: "Optional: If true, returns only events with valid HMAC signatures (default: false)";
            };
        };
    };
};
/**
 * Tool handler implementation
 */
export declare class GetWebhookEventsHandler {
    constructor();
    /**
     * Handle get_webhook_events tool call
     */
    handle(args: unknown): Promise<GetWebhookEventsOutput>;
}
/**
 * Create handler instance
 */
export declare function getWebhookEventsHandler(): GetWebhookEventsHandler;
//# sourceMappingURL=get-webhook-events.d.ts.map