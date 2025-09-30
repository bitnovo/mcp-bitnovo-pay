export declare enum TunnelProvider {
    NGROK = "ngrok",
    ZROK = "zrok",
    MANUAL = "manual"
}
export declare enum TunnelStatus {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    ERROR = "error"
}
export interface TunnelConfiguration {
    enabled: boolean;
    provider: TunnelProvider;
    localPort: number;
    publicUrl?: string;
    ngrokAuthToken?: string;
    ngrokDomain?: string;
    zrokToken?: string;
    zrokUniqueName?: string;
    healthCheckInterval: number;
    reconnectMaxRetries: number;
    reconnectBackoffMs: number;
}
export interface TunnelInfo {
    provider: TunnelProvider;
    status: TunnelStatus;
    publicUrl: string | null;
    connectedAt: Date | null;
    lastError: string | null;
    reconnectAttempts: number;
    healthCheckEnabled: boolean;
}
/**
 * Tunnel Manager - Factory and lifecycle management
 */
export declare class TunnelManager {
    private provider;
    private config;
    constructor(config: TunnelConfiguration);
    start(): Promise<string>;
    stop(): Promise<void>;
    getInfo(): TunnelInfo | null;
    isConnected(): boolean;
    getPublicUrl(): string | null;
}
export default TunnelManager;
//# sourceMappingURL=tunnel-manager.d.ts.map