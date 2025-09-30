// Environment variable validation at startup
import { validateEnvironmentConfig } from '../utils/validation.js';
import { getLogger } from '../utils/logger.js';
class ConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigurationError';
    }
}
const logger = getLogger();
export class EnvironmentValidator {
    /**
     * Validate environment configuration at startup
     */
    static validate() {
        const errors = [];
        const warnings = [];
        logger.info('Starting environment validation', {
            operation: 'env_validation',
        });
        try {
            // Get environment variables
            const env = process.env;
            // Validate using zod schema
            const validation = validateEnvironmentConfig(env);
            if (!validation.success) {
                errors.push(`Environment validation failed: ${validation.error.message}`);
                logger.error('Environment validation failed', new Error(validation.error.message), {
                    field: validation.error.field,
                    code: validation.error.code,
                    operation: 'env_validation_error',
                });
                return { valid: false, errors, warnings };
            }
            const config = validation.data;
            // Additional business logic validations
            this.validateBusinessRules(config, errors, warnings);
            // Log validation results
            if (errors.length > 0) {
                logger.info('Environment validation failed with errors', {
                    errorCount: errors.length,
                    warningCount: warnings.length,
                    operation: 'env_validation_failed',
                });
            }
            else if (warnings.length > 0) {
                logger.warn('Environment validation passed with warnings', {
                    warningCount: warnings.length,
                    operation: 'env_validation_warnings',
                });
            }
            else {
                logger.info('Environment validation passed', {
                    operation: 'env_validation_success',
                });
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings,
                config: this.createSafeConfig(config),
            };
        }
        catch (error) {
            const errorMessage = `Environment validation crashed: ${error.message}`;
            errors.push(errorMessage);
            logger.error('Environment validation crashed', error, {
                operation: 'env_validation_crash',
            });
            return { valid: false, errors, warnings };
        }
    }
    /**
     * Validate business-specific rules
     */
    static validateBusinessRules(config, errors, warnings) {
        // Device ID format validation
        if (config.BITNOVO_DEVICE_ID) {
            if (config.BITNOVO_DEVICE_ID.length < 8) {
                errors.push('BITNOVO_DEVICE_ID must be at least 8 characters long');
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(config.BITNOVO_DEVICE_ID)) {
                warnings.push('BITNOVO_DEVICE_ID contains unusual characters');
            }
        }
        // Base URL validation
        if (config.BITNOVO_BASE_URL) {
            try {
                const url = new URL(config.BITNOVO_BASE_URL);
                if (url.protocol !== 'https:') {
                    if (config.NODE_ENV === 'production') {
                        errors.push('BITNOVO_BASE_URL must use HTTPS in production');
                    }
                    else {
                        warnings.push('BITNOVO_BASE_URL should use HTTPS for security');
                    }
                }
                if (url.hostname === 'localhost' && config.NODE_ENV === 'production') {
                    errors.push('BITNOVO_BASE_URL cannot be localhost in production');
                }
            }
            catch (error) {
                errors.push('BITNOVO_BASE_URL must be a valid URL');
            }
        }
        // Device secret validation
        if (config.BITNOVO_DEVICE_SECRET) {
            if (config.BITNOVO_DEVICE_SECRET.length < 16) {
                warnings.push('BITNOVO_DEVICE_SECRET should be at least 16 characters for security');
            }
        }
        else {
            warnings.push('BITNOVO_DEVICE_SECRET not set - webhook validation will be disabled');
        }
        // Performance configuration validation
        if (config.API_TIMEOUT && config.API_TIMEOUT > 10000) {
            warnings.push('API_TIMEOUT is very high, may cause poor user experience');
        }
        if (config.MAX_RETRIES && config.MAX_RETRIES > 3) {
            warnings.push('MAX_RETRIES is high, may cause slow responses');
        }
        // Log level validation
        if (config.LOG_LEVEL === 'debug' && config.NODE_ENV === 'production') {
            warnings.push('Debug logging enabled in production may impact performance');
        }
        // Node environment specific validations
        if (config.NODE_ENV === 'production') {
            if (!config.BITNOVO_DEVICE_SECRET) {
                warnings.push('Consider setting BITNOVO_DEVICE_SECRET in production for webhook security');
            }
            if (config.LOG_LEVEL === 'debug') {
                warnings.push('Debug log level in production may expose sensitive information');
            }
        }
    }
    /**
     * Create safe configuration object for logging (without sensitive data)
     */
    static createSafeConfig(config) {
        return {
            hasDeviceId: !!config.BITNOVO_DEVICE_ID,
            deviceIdLength: config.BITNOVO_DEVICE_ID?.length || 0,
            baseUrl: config.BITNOVO_BASE_URL,
            hasDeviceSecret: !!config.BITNOVO_DEVICE_SECRET,
            logLevel: config.LOG_LEVEL,
            nodeEnv: config.NODE_ENV,
            apiTimeout: config.API_TIMEOUT,
            maxRetries: config.MAX_RETRIES,
            retryDelay: config.RETRY_DELAY,
        };
    }
    /**
     * Generate environment setup guide for missing configuration
     */
    static generateSetupGuide(validationResult) {
        if (validationResult.valid) {
            return 'Environment configuration is valid.';
        }
        const guide = [
            '# MCP Bitnovo Pay Server - Environment Setup Guide',
            '',
            'Your environment configuration has issues. Please follow these steps:',
            '',
        ];
        if (validationResult.errors.length > 0) {
            guide.push('## Required Fixes:');
            validationResult.errors.forEach((error, index) => {
                guide.push(`${index + 1}. ${error}`);
            });
            guide.push('');
        }
        if (validationResult.warnings.length > 0) {
            guide.push('## Recommended Improvements:');
            validationResult.warnings.forEach((warning, index) => {
                guide.push(`${index + 1}. ${warning}`);
            });
            guide.push('');
        }
        guide.push('## Environment Variables Reference:');
        guide.push('```bash');
        guide.push('# Required');
        guide.push('BITNOVO_DEVICE_ID="your-device-id-from-bitnovo"');
        guide.push('BITNOVO_BASE_URL="https://pos.bitnovo.com"');
        guide.push('');
        guide.push('# Optional but recommended');
        guide.push('BITNOVO_DEVICE_SECRET="your-webhook-secret"');
        guide.push('LOG_LEVEL="info"');
        guide.push('NODE_ENV="production"');
        guide.push('');
        guide.push('# Optional performance tuning');
        guide.push('API_TIMEOUT="5000"');
        guide.push('MAX_RETRIES="2"');
        guide.push('RETRY_DELAY="1000"');
        guide.push('```');
        guide.push('');
        guide.push('Copy the above to your .env file and update with your actual values.');
        return guide.join('\n');
    }
    /**
     * Validate configuration and exit if invalid
     */
    static validateOrExit() {
        const result = this.validate();
        if (!result.valid) {
            // Don't use console output in MCP mode as it breaks the JSON protocol
            // Throw error instead - will be handled by application error handlers
            const errorMessage = `Environment configuration is invalid: ${result.errors.join(', ')}`;
            throw new ConfigurationError(errorMessage);
        }
        // Silently handle warnings - don't output to console in MCP mode
        // Application logger can handle warnings if needed
        return result.config;
    }
}
export default EnvironmentValidator;
//# sourceMappingURL=env-validator.js.map