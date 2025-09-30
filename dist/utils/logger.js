// Structured logging with sensitive data masking for constitutional privacy compliance
import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConfig, maskDeviceId } from '../config/index.js';
class DataMasker {
    // Sensitive fields that should always be masked
    static SENSITIVE_FIELDS = new Set([
        'deviceId',
        'device_id',
        'deviceSecret',
        'device_secret',
        'secret',
        'key',
        'token',
        'password',
        'signature',
        'address',
        'payment_uri',
        'web_url',
    ]);
    // Patterns for masking sensitive data in strings
    static PATTERNS = [
        // Device IDs (alphanumeric with dashes)
        { pattern: /\b[a-zA-Z0-9]{8,}-[a-zA-Z0-9-]+/g, mask: '****-****-****' },
        // Bitcoin addresses (base58, 26-35 chars starting with 1, 3, or bc1)
        {
            pattern: /\b(1|3|bc1)[a-zA-Z0-9]{25,60}/g,
            mask: (match) => `${match.slice(0, 8)}...${match.slice(-8)}`,
        },
        // Ethereum addresses (0x + 40 hex chars)
        {
            pattern: /\b0x[a-fA-F0-9]{40}/g,
            mask: (match) => `${match.slice(0, 8)}...${match.slice(-8)}`,
        },
        // URLs (mask query parameters and paths, keep domain)
        {
            pattern: /https?:\/\/([^\/\s]+)(\/[^\s]*)?/g,
            mask: (match, domain) => `https://${domain}/***`,
        },
        // UUIDs
        {
            pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
            mask: (match) => `${match.slice(0, 8)}-****-****`,
        },
    ];
    static maskObject(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj === 'string') {
            return this.maskString(obj);
        }
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.maskObject(item));
        }
        if (typeof obj === 'object') {
            const masked = {};
            for (const [key, value] of Object.entries(obj)) {
                if (this.SENSITIVE_FIELDS.has(key.toLowerCase())) {
                    if (key.toLowerCase().includes('deviceid') ||
                        key.toLowerCase().includes('device_id')) {
                        masked[key] =
                            typeof value === 'string' ? maskDeviceId(value) : '****';
                    }
                    else if (typeof value === 'string' && value.length > 8) {
                        masked[key] = `${value.slice(0, 4)}****${value.slice(-4)}`;
                    }
                    else {
                        masked[key] = '****';
                    }
                }
                else {
                    masked[key] = this.maskObject(value);
                }
            }
            return masked;
        }
        return obj;
    }
    static maskString(str) {
        let masked = str;
        for (const { pattern, mask } of this.PATTERNS) {
            if (typeof mask === 'function') {
                masked = masked.replace(pattern, mask);
            }
            else {
                masked = masked.replace(pattern, mask);
            }
        }
        return masked;
    }
    static maskAmount(amount, precision = 2) {
        if (amount === undefined)
            return 'N/A';
        // Round to avoid exposing exact amounts in logs
        return `~${amount.toFixed(precision)}`;
    }
}
class Logger {
    winston;
    constructor() {
        const config = getConfig();
        const formats = [
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const maskedMeta = DataMasker.maskObject(meta);
                const metaString = Object.keys(maskedMeta || {}).length > 0
                    ? ` ${JSON.stringify(maskedMeta)}`
                    : '';
                return `${timestamp} [${level.toUpperCase()}] ${message}${metaString}`;
            }),
        ];
        // Add colorization in development
        if (config.nodeEnv === 'development') {
            formats.splice(1, 0, winston.format.colorize());
        }
        // Detect if running as MCP server
        // Since Claude Desktop doesn't set TTY correctly, use more aggressive detection
        const isIndexJs = process.argv[1]?.includes('index.js') ||
            process.argv[0]?.includes('index.js');
        const hasNodeBin = process.argv[0]?.includes('node');
        const isProductionLike = config.nodeEnv === 'production' || process.env.MCP_MODE === 'true';
        // Assume MCP mode if running index.js directly with node (typical MCP pattern)
        const isMCPMode = isIndexJs && hasNodeBin;
        const transports = [];
        // In MCP mode, completely disable logging to avoid any stdout/stderr contamination
        if (!isMCPMode) {
            transports.push(new winston.transports.Console({
                stderrLevels: ['error'],
            }));
        }
        this.winston = winston.createLogger({
            level: isMCPMode ? 'silent' : config.logLevel,
            format: winston.format.combine(...formats),
            transports,
            silent: isMCPMode, // Completely disable logging in MCP mode
        });
        // Only add file transport if NOT in MCP mode to avoid any file I/O issues
        if (!isMCPMode) {
            try {
                // Get absolute path to project root
                const currentDir = dirname(fileURLToPath(import.meta.url));
                const projectRoot = resolve(currentDir, '../../');
                const logsDir = resolve(projectRoot, 'logs');
                const logFile = resolve(logsDir, 'mcp-bitnovo-pay.log');
                // Ensure logs directory exists
                if (!existsSync(logsDir)) {
                    mkdirSync(logsDir, { recursive: true });
                }
                this.winston.add(new winston.transports.File({
                    filename: logFile,
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 5,
                }));
            }
            catch (error) {
                // Silently fallback - no console output in MCP mode
            }
        }
    }
    info(message, context) {
        this.winston.info(message, context);
    }
    warn(message, context) {
        this.winston.warn(message, context);
    }
    error(message, error, context) {
        const errorContext = {
            ...context,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
        };
        this.winston.error(message, errorContext);
    }
    debug(message, context) {
        this.winston.debug(message, context);
    }
    // Specialized logging methods for MCP operations
    toolCall(toolName, input, requestId) {
        this.info(`Tool called: ${toolName}`, {
            tool: toolName,
            input: DataMasker.maskObject(input),
            requestId,
        });
    }
    toolResult(toolName, success, duration, requestId) {
        const level = success ? 'info' : 'warn';
        this.winston[level](`Tool completed: ${toolName}`, {
            tool: toolName,
            success,
            duration: `${duration}ms`,
            requestId,
        });
    }
    apiCall(method, url, duration, statusCode) {
        const maskedUrl = DataMasker.maskString(url);
        this.info(`API call: ${method} ${maskedUrl}`, {
            method,
            url: maskedUrl,
            duration,
            statusCode,
        });
    }
    paymentOperation(operation, paymentId, amount, currency) {
        this.info(`Payment operation: ${operation}`, {
            operation,
            paymentId: paymentId.slice(0, 8) + '...',
            amount: amount ? DataMasker.maskAmount(amount) : undefined,
            currency,
        });
    }
    configLoaded(maskedConfig) {
        this.info('Configuration loaded', { config: maskedConfig });
    }
    serverStarted(serverName, tools) {
        this.info(`MCP server started: ${serverName}`, {
            server: serverName,
            tools: tools.length,
            toolNames: tools,
        });
    }
}
// Singleton logger instance
let logger = null;
export function getLogger() {
    if (!logger) {
        logger = new Logger();
    }
    return logger;
}
export function resetLogger() {
    logger = null;
}
// Export masker for use in other modules
export { DataMasker };
//# sourceMappingURL=logger.js.map