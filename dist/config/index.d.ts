import type { Configuration } from '../types/index.js';
export declare class ConfigurationError extends Error {
    constructor(message: string);
}
export declare function loadConfiguration(): Configuration;
export declare function getMaskedConfig(config: Configuration): Record<string, unknown>;
export declare function maskDeviceId(deviceId: string): string;
export declare function getConfig(): Configuration;
export declare function resetConfig(): void;
export declare function isDevelopment(): boolean;
export declare function isProduction(): boolean;
export declare function isTest(): boolean;
//# sourceMappingURL=index.d.ts.map