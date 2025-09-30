import { TunnelProvider } from './tunnel-manager.js';
export declare enum ExecutionContext {
    N8N = "n8n",
    OPAL = "opal",
    DOCKER = "docker",
    KUBERNETES = "kubernetes",
    SERVER = "server",// Generic VPS/server with public IP
    LOCAL = "local",// Local development machine
    UNKNOWN = "unknown"
}
export interface ContextDetectionResult {
    context: ExecutionContext;
    confidence: number;
    suggestedProvider: TunnelProvider;
    indicators: string[];
    publicUrl?: string;
}
/**
 * Detects the current execution context
 */
export declare function detectContext(): ContextDetectionResult;
/**
 * Validates if a detected public URL is actually accessible
 */
export declare function validatePublicUrl(url: string): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * Gets recommended tunnel configuration based on context
 */
export declare function getRecommendedTunnelConfig(detectionResult: ContextDetectionResult): {
    provider: TunnelProvider;
    reason: string;
    publicUrl?: string;
};
export default detectContext;
//# sourceMappingURL=context-detector.d.ts.map