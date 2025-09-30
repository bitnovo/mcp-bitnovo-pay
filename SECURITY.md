# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in MCP Bitnovo Pay, please send an email to **security@bitnovo.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If the issue is confirmed, we will:
1. Release a security patch as soon as possible
2. Credit you in the CHANGELOG (unless you prefer to remain anonymous)
3. Notify users through appropriate channels

## Security Best Practices

### For Developers

1. **Never Commit Secrets**
   - Device IDs, device secrets, and API keys must never be committed to the repository
   - Use MCP client configuration files for credentials
   - Check `.gitignore` blocks all sensitive files

2. **Input Validation**
   - All user inputs are validated using Zod schemas
   - Amount limits are enforced per cryptocurrency
   - URL validation ensures HTTPS for redirect endpoints

3. **Data Privacy**
   - Sensitive data (addresses, device IDs) are automatically masked in logs
   - Exchange rates are not exposed to prevent information leakage
   - Payment details require proper authentication

4. **Dependencies**
   - Run `npm audit` regularly to check for vulnerabilities
   - Keep dependencies updated
   - Review security advisories

### For Users

1. **Protect Your Device ID and Secret**
   - Store credentials securely in your MCP client configuration
   - Never share Device ID publicly
   - Rotate Device Secret regularly

2. **Verify API Endpoints**
   - Use official Bitnovo API endpoints only
   - Production: `https://pos.bitnovo.com`
   - Always use HTTPS, never HTTP

3. **Monitor Payments**
   - Regularly check payment status through official channels
   - Verify webhook signatures if using webhooks
   - Report suspicious activity immediately

4. **Environment Configuration**
   - Use production mode in production environments
   - Limit log levels in production (`info` or `warn`)
   - Review logs for suspicious activity

## Security Features

### Built-in Protections

1. **HTTPS Enforcement**
   - All API calls use HTTPS
   - HTTP endpoints are rejected
   - Certificate validation enabled

2. **HMAC Signature Validation**
   - Optional webhook signature verification
   - Uses Device Secret for HMAC validation
   - Prevents webhook spoofing

3. **Data Masking**
   - Automatic masking of sensitive data in all logs
   - Addresses shortened to first/last 8 characters
   - Device IDs partially masked
   - URLs sanitized in logs

4. **Rate Limiting Awareness**
   - Client respects API rate limits
   - Automatic retry with exponential backoff
   - No retry on 429 (rate limit) errors

5. **Timeout Protection**
   - Configurable API timeouts (default 10s)
   - Currency-specific timeout optimization
   - Prevents hanging requests

6. **Input Sanitization**
   - XSS prevention in notes fields
   - HTML tags stripped from user input
   - Length limits enforced

## Known Limitations

1. **Stateless Operation**
   - No local persistence of payment data
   - Real-time API queries required
   - Cache is memory-only (cleared on restart)

2. **Single-Tenant Architecture**
   - One Device ID per server instance
   - No multi-tenant isolation
   - Credentials shared across all tools

3. **Webhook Security**
   - HMAC validation is optional
   - Requires Device Secret configuration
   - Users must implement endpoint security

## Compliance

- **GDPR**: Minimal data collection, no PII stored locally
- **PCI DSS**: No credit card data handled
- **Privacy**: No exchange rate data exposed

## Updates and Patches

Security updates are released as soon as possible after discovery. Users should:
- Subscribe to GitHub releases
- Monitor CHANGELOG.md for security notes
- Update to latest versions promptly

## Contact

For security concerns:
- Email: security@bitnovo.com
- GitHub: https://github.com/bitnovo/mcp-bitnovo-pay/security

For general issues:
- GitHub Issues: https://github.com/bitnovo/mcp-bitnovo-pay/issues