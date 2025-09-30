export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    config?: Record<string, unknown>;
}
export declare class EnvironmentValidator {
    /**
     * Validate environment configuration at startup
     */
    static validate(): ValidationResult;
    /**
     * Validate business-specific rules
     */
    private static validateBusinessRules;
    /**
     * Create safe configuration object for logging (without sensitive data)
     */
    private static createSafeConfig;
    /**
     * Generate environment setup guide for missing configuration
     */
    static generateSetupGuide(validationResult: ValidationResult): string;
    /**
     * Validate configuration and exit if invalid
     */
    static validateOrExit(): Record<string, unknown>;
}
export default EnvironmentValidator;
//# sourceMappingURL=env-validator.d.ts.map