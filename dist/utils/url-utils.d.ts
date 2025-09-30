/**
 * Configuration for different environments and their base domains
 */
export interface EnvironmentConfig {
    development: string;
    testing: string;
    production: string;
}
/**
 * Default base domains for Bitnovo Pay gateway URLs
 */
export declare const DEFAULT_GATEWAY_DOMAINS: EnvironmentConfig;
/**
 * Extract short identifier from a Bitnovo payment web URL
 *
 * Examples:
 * - "https://pay.bitnovo.com/abcd1234/" -> "abcd1234"
 * - "https://dev-paytest.bitnovo.com/xyz789/" -> "xyz789"
 *
 * @param webUrl - The full web URL from payment response
 * @returns The extracted short identifier or null if not found
 */
export declare function extractShortIdentifierFromUrl(webUrl: string): string | null;
/**
 * Determine the appropriate environment based on the base URL configuration
 *
 * @param baseUrl - The base URL from configuration (e.g., BITNOVO_BASE_URL)
 * @returns The environment type
 */
export declare function determineEnvironment(baseUrl: string): keyof EnvironmentConfig;
/**
 * Generate a payment gateway URL using short identifier
 *
 * @param shortIdentifier - The short identifier extracted from payment
 * @param environment - The target environment (defaults to auto-detect from process.env)
 * @param customDomains - Optional custom domain configuration
 * @returns The complete gateway URL
 */
export declare function generateGatewayUrl(shortIdentifier: string, environment?: keyof EnvironmentConfig, customDomains?: Partial<EnvironmentConfig>): string;
/**
 * Generate gateway URL directly from payment web URL
 *
 * This is a convenience function that combines extraction and generation
 *
 * @param webUrl - The original web URL from payment response
 * @param environment - Optional environment override
 * @param customDomains - Optional custom domain configuration
 * @returns The gateway URL or null if extraction fails
 */
export declare function generateGatewayUrlFromWebUrl(webUrl: string, environment?: keyof EnvironmentConfig, customDomains?: Partial<EnvironmentConfig>): string | null;
/**
 * Validate that a URL appears to be a valid Bitnovo payment gateway URL
 *
 * @param url - The URL to validate
 * @returns True if the URL appears to be a valid gateway URL
 */
export declare function isValidGatewayUrl(url: string): boolean;
/**
 * Get the base domain for the current environment
 *
 * @param customDomains - Optional custom domain configuration
 * @returns The base domain string
 */
export declare function getCurrentEnvironmentDomain(customDomains?: Partial<EnvironmentConfig>): string;
/**
 * Create a short URL for sharing (for display purposes)
 *
 * @param gatewayUrl - The full gateway URL
 * @returns A shortened version for display
 */
export declare function createDisplayUrl(gatewayUrl: string): string;
//# sourceMappingURL=url-utils.d.ts.map