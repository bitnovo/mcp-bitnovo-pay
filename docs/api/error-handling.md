# Error Handling Guide

Comprehensive guide for handling errors in the MCP Bitnovo Pay server.

## 📋 Overview

The MCP Bitnovo Pay server provides structured error responses with clear codes, messages, and recovery suggestions. All errors follow a consistent format to enable proper error handling across different LLM platforms.

## 🔧 Error Response Format

All errors follow this standard structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": "Additional context or recovery suggestions",
    "http_status": 400,
    "timestamp": "2025-01-15T10:30:00Z",
    "tool": "tool_name_that_failed"
  }
}
```

### Error Fields

- **`code`**: Unique error identifier for programmatic handling
- **`message`**: Clear, user-friendly error description
- **`details`**: Additional context, recovery steps, or related data
- **`http_status`**: HTTP status code equivalent
- **`timestamp`**: Error occurrence time (ISO 8601)
- **`tool`**: MCP tool that generated the error

## 🚨 Error Categories

### 1. Validation Errors (400)

Errors caused by invalid input parameters.

#### INVALID_AMOUNT
**Cause**: Payment amount is invalid (negative, zero, or too precise)

```json
{
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Payment amount must be positive and greater than 0.01 EUR",
    "details": "Received: -5.0, minimum required: 0.01",
    "http_status": 400
  }
}
```

**Recovery**: Validate amount is positive and meets minimum requirements.

#### AMOUNT_TOO_LOW
**Cause**: Amount below minimum for specified currency

```json
{
  "error": {
    "code": "AMOUNT_TOO_LOW",
    "message": "Payment amount 0.005 EUR is below minimum for BTC",
    "details": {
      "provided_amount": 0.005,
      "min_amount": 0.01,
      "max_amount": null,
      "currency": "BTC"
    },
    "http_status": 400
  }
}
```

**Recovery**: Increase amount or choose different currency. Use `list_currencies_catalog` to check limits.

#### AMOUNT_TOO_HIGH
**Cause**: Amount exceeds maximum for specified currency

```json
{
  "error": {
    "code": "AMOUNT_TOO_HIGH",
    "message": "Payment amount 15000 EUR exceeds maximum for USDC_ETH",
    "details": {
      "provided_amount": 15000,
      "min_amount": 1.0,
      "max_amount": 5000.0,
      "currency": "USDC_ETH"
    },
    "http_status": 400
  }
}
```

**Recovery**: Reduce amount, split into multiple payments, or choose unlimited currency (e.g., BTC).

#### INVALID_CURRENCY
**Cause**: Unsupported or malformed cryptocurrency symbol

```json
{
  "error": {
    "code": "INVALID_CURRENCY",
    "message": "Cryptocurrency 'INVALID_COIN' is not supported",
    "details": "Use list_currencies_catalog to see available options",
    "http_status": 400
  }
}
```

**Recovery**: Check spelling, use `list_currencies_catalog` to find valid symbols.

#### INVALID_FIAT_CURRENCY
**Cause**: Unsupported fiat currency code

```json
{
  "error": {
    "code": "INVALID_FIAT_CURRENCY",
    "message": "Fiat currency 'XYZ' is not supported",
    "details": "Supported currencies: EUR, USD, GBP, CAD, AUD, etc.",
    "http_status": 400
  }
}
```

**Recovery**: Use supported ISO 4217 currency codes. EUR is always supported.

#### INVALID_URL
**Cause**: Malformed redirect URLs in `create_payment_redirect`

```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "Redirect URL is not valid",
    "details": {
      "field": "url_ok",
      "value": "not-a-valid-url",
      "requirement": "Must be HTTPS URL"
    },
    "http_status": 400
  }
}
```

**Recovery**: Ensure URLs are well-formed and use HTTPS protocol.

### 2. Authentication Errors (401)

Errors related to Bitnovo Pay device credentials.

#### INVALID_DEVICE
**Cause**: Device ID not found or inactive

```json
{
  "error": {
    "code": "INVALID_DEVICE",
    "message": "Device authentication failed",
    "details": "Check BITNOVO_DEVICE_ID environment variable",
    "http_status": 401
  }
}
```

**Recovery**: Verify Device ID, check environment variables, ensure device is active in Bitnovo dashboard.

#### DEVICE_SUSPENDED
**Cause**: Device temporarily suspended

```json
{
  "error": {
    "code": "DEVICE_SUSPENDED",
    "message": "Device has been suspended",
    "details": "Contact Bitnovo support for account reactivation",
    "http_status": 401
  }
}
```

**Recovery**: Contact Bitnovo Pay support to resolve account issues.

#### INVALID_SIGNATURE
**Cause**: HMAC signature validation failed (webhook context)

```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Webhook signature validation failed",
    "details": "Check BITNOVO_DEVICE_SECRET configuration",
    "http_status": 401
  }
}
```

**Recovery**: Verify Device Secret, check HMAC calculation, ensure proper headers.

### 3. Not Found Errors (404)

Errors when requested resources don't exist.

#### PAYMENT_NOT_FOUND
**Cause**: Payment identifier doesn't exist

```json
{
  "error": {
    "code": "PAYMENT_NOT_FOUND",
    "message": "Payment with identifier 'invalid-id' not found",
    "details": "Check payment identifier or create new payment",
    "http_status": 404
  }
}
```

**Recovery**: Verify payment ID spelling, check if payment expired, create new payment if needed.

#### CURRENCY_NOT_AVAILABLE
**Cause**: Currency exists but not available for current device

```json
{
  "error": {
    "code": "CURRENCY_NOT_AVAILABLE",
    "message": "Currency 'BTC' is not available for your device",
    "details": "Contact Bitnovo to enable additional currencies",
    "http_status": 404
  }
}
```

**Recovery**: Use available currencies or contact Bitnovo to enable additional options.

### 4. Rate Limiting Errors (429)

Errors due to API rate limits.

#### RATE_LIMIT_EXCEEDED
**Cause**: Too many requests in time window

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded: 10 requests per minute",
    "details": {
      "limit": 10,
      "window": "1 minute",
      "retry_after": 45
    },
    "http_status": 429
  }
}
```

**Recovery**: Wait for retry_after seconds, implement exponential backoff, reduce request frequency.

### 5. Server Errors (500)

Internal server or upstream API errors.

#### INTERNAL_SERVER_ERROR
**Cause**: Unexpected server error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An internal error occurred processing your request",
    "details": "Please retry in a few moments",
    "http_status": 500
  }
}
```

**Recovery**: Retry with exponential backoff, check server status, contact support if persistent.

#### UPSTREAM_API_ERROR
**Cause**: Bitnovo API error

```json
{
  "error": {
    "code": "UPSTREAM_API_ERROR",
    "message": "Bitnovo Pay API is temporarily unavailable",
    "details": {
      "upstream_status": 503,
      "upstream_message": "Service temporarily unavailable",
      "retry_suggested": true
    },
    "http_status": 502
  }
}
```

**Recovery**: Retry after delay, check Bitnovo status page, implement fallback mechanisms.

#### TIMEOUT_ERROR
**Cause**: Request timeout (>5 seconds)

```json
{
  "error": {
    "code": "TIMEOUT_ERROR",
    "message": "Request timed out after 5 seconds",
    "details": "The operation may have succeeded. Check payment status.",
    "http_status": 504
  }
}
```

**Recovery**: Check operation status before retrying, implement longer timeouts for status checks.

### 6. Configuration Errors

Errors in MCP server setup or environment.

#### MISSING_ENVIRONMENT_VARIABLE
**Cause**: Required environment variable not set

```json
{
  "error": {
    "code": "MISSING_ENVIRONMENT_VARIABLE",
    "message": "Required environment variable BITNOVO_DEVICE_ID is not set",
    "details": "Set environment variable or check MCP server configuration",
    "http_status": 500
  }
}
```

**Recovery**: Set missing environment variables, check MCP server configuration files.

#### INVALID_CONFIGURATION
**Cause**: Invalid server configuration

```json
{
  "error": {
    "code": "INVALID_CONFIGURATION",
    "message": "Invalid BITNOVO_BASE_URL configuration",
    "details": {
      "provided": "invalid-url",
      "expected": "Valid HTTPS URL (e.g., https://pos.bitnovo.com)"
    },
    "http_status": 500
  }
}
```

**Recovery**: Fix configuration values, restart MCP server.

## 🔄 Retry Logic and Backoff

### Automatic Retries

The MCP server automatically retries certain operations:

- **Network errors**: Up to 2 retries with exponential backoff
- **Rate limits**: Automatic delay based on `Retry-After` header
- **Timeouts**: Single retry with increased timeout

### Retry Strategy

```
Initial delay: 1 second
Max retries: 2
Backoff multiplier: 2
Max delay: 10 seconds

Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 second delay
Give up: Return error
```

### When NOT to Retry

- **400 errors**: Input validation failures
- **401 errors**: Authentication issues
- **404 errors**: Resource not found
- **Payment already completed**: Status `CO`

## 🛠️ Error Handling Best Practices

### 1. For LLM Applications

#### Graceful Degradation
```typescript
// Example error handling in AI responses
try {
  const payment = await create_payment_onchain(params);
  return `Payment created: ${payment.identifier}`;
} catch (error) {
  if (error.code === 'INVALID_CURRENCY') {
    // Offer alternatives
    const currencies = await list_currencies_catalog();
    return `Currency not supported. Available options: ${currencies.map(c => c.symbol).join(', ')}`;
  }

  if (error.code === 'AMOUNT_TOO_LOW') {
    return `Minimum payment amount is ${error.details.min_amount} EUR for ${error.details.currency}`;
  }

  return `Payment creation failed: ${error.message}. Please try again.`;
}
```

#### User-Friendly Messages
- Convert technical errors to conversational language
- Provide specific recovery suggestions
- Offer alternative approaches when possible

### 2. For Integration Code

#### Comprehensive Error Mapping
```typescript
const ERROR_MESSAGES = {
  'INVALID_CURRENCY': 'Please select a supported cryptocurrency',
  'AMOUNT_TOO_LOW': 'Payment amount is too small for selected currency',
  'RATE_LIMIT_EXCEEDED': 'Please wait a moment before trying again',
  'PAYMENT_NOT_FOUND': 'Payment not found. It may have expired.',
};

function handlePaymentError(error) {
  const userMessage = ERROR_MESSAGES[error.code] || 'Payment processing failed';
  const shouldRetry = ['RATE_LIMIT_EXCEEDED', 'TIMEOUT_ERROR'].includes(error.code);

  return {
    message: userMessage,
    canRetry: shouldRetry,
    retryAfter: error.details?.retry_after
  };
}
```

### 3. Monitoring and Logging

#### Error Tracking
```typescript
// Log errors for monitoring
function logError(error, context) {
  console.error('MCP Payment Error:', {
    code: error.code,
    message: error.message,
    tool: error.tool,
    context: context,
    timestamp: error.timestamp
  });
}
```

#### Common Patterns to Monitor
- High frequency of `INVALID_CURRENCY` errors → Improve UI guidance
- `RATE_LIMIT_EXCEEDED` → Implement request queuing
- `TIMEOUT_ERROR` spikes → Check network/server health
- `DEVICE_SUSPENDED` → Account management issue

## 🔍 Troubleshooting Guide

### Configuration Issues

#### Problem: "MISSING_ENVIRONMENT_VARIABLE"
**Diagnosis**:
```bash
# Check environment variables
echo $BITNOVO_DEVICE_ID
echo $BITNOVO_BASE_URL
```

**Solutions**:
1. Set missing variables in shell
2. Add to MCP configuration file
3. Check configuration syntax

#### Problem: "INVALID_DEVICE"
**Diagnosis**:
```bash
# Verify device ID format (UUID)
# Check Bitnovo dashboard device status
```

**Solutions**:
1. Verify Device ID spelling
2. Check device is active in Bitnovo dashboard
3. Try with different Device ID

### Runtime Issues

#### Problem: Frequent timeouts
**Diagnosis**:
- Network connectivity to Bitnovo API
- Server resource utilization
- Request complexity

**Solutions**:
1. Increase timeout configuration
2. Check network latency
3. Optimize request parameters

#### Problem: Rate limiting
**Diagnosis**:
- Request frequency patterns
- Multiple concurrent clients
- Batch operation timing

**Solutions**:
1. Implement request queuing
2. Add delays between operations
3. Use exponential backoff

### Payment Issues

#### Problem: "PAYMENT_NOT_FOUND"
**Common Causes**:
- Payment expired (typically 15 minutes)
- Incorrect identifier
- Payment from different device

**Solutions**:
1. Check identifier spelling
2. Verify payment hasn't expired
3. Create new payment if needed

#### Problem: Amount validation errors
**Common Causes**:
- Currency minimums/maximums
- Precision issues
- Wrong currency selection

**Solutions**:
1. Use `list_currencies_catalog` to check limits
2. Round amounts appropriately
3. Choose different currency

## 📊 Error Monitoring Dashboard

### Key Metrics to Track

1. **Error Rate by Type**
   - Validation errors (400s)
   - Authentication errors (401s)
   - Server errors (500s)

2. **Response Time Percentiles**
   - P50, P95, P99 response times
   - Timeout frequency

3. **Currency Usage Patterns**
   - Most requested currencies
   - Invalid currency attempts

4. **Payment Success Rate**
   - Successful vs failed payments
   - Time to completion

### Alerting Thresholds

- **Error rate > 5%**: Investigate immediately
- **Timeout rate > 2%**: Check network/server
- **Auth failures > 1%**: Check device status
- **New error codes**: Review and document

---

**Next**: Return to [API Tools Reference](tools-reference.md) for detailed tool documentation or check [Usage Examples](examples.md) for implementation patterns.