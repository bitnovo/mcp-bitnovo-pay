# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added
- Initial release of MCP Bitnovo Pay server
- Five MCP tools for cryptocurrency payment management:
  - `create_payment_onchain` - Generate cryptocurrency addresses for direct payments
  - `create_payment_link` - Create web payment URLs with redirect handling
  - `get_payment_status` - Query payment status with detailed information
  - `list_currencies_catalog` - Get supported cryptocurrencies with filtering
  - `generate_payment_qr` - Generate custom QR codes from existing payments
- Multi-LLM support (OpenAI, Google Gemini, Claude)
- Privacy-focused logging with sensitive data masking
- Retry logic with exponential backoff
- Comprehensive error handling with structured error codes
- TypeScript strict mode implementation
- Test suite with Jest (80%+ coverage target)
- Security features:
  - HTTPS enforcement
  - HMAC signature validation for webhooks
  - Environment variable validation
  - Graceful shutdown handling

### Security
- Sensitive data (addresses, device IDs, secrets) are masked in all logs
- No exchange rates exposed in responses (privacy protection)
- URL validation for redirect endpoints
- Zod schema validation for all inputs

## [1.1.0] - 2025-09-30

### Added
- High-quality QR code generation with improved algorithms
- Bitnovo Pay logo branding in QR codes (from SVG asset)
- Three additional webhook-related MCP tools:
  - `get_webhook_events` - Query webhook events received in real-time
  - `get_webhook_url` - Get public webhook URL with configuration
  - `get_tunnel_status` - Diagnose tunnel connection status
- Automatic webhook tunnel system with 3 providers (ngrok, zrok, manual)
- Context auto-detection for deployment environments

### Changed
- QR code default size increased from 300px to 512px
- QR code maximum size increased from 1000px to 2000px
- Improved QR pattern rendering with `nearest` kernel (sharper edges)
- Enhanced logo scaling with `lanczos3` kernel (smoother scaling)
- PNG compression optimized (level 6 with adaptive filtering)
- Better quality for printing and high-resolution displays

### Improved
- QR codes now have sharp, well-defined edges without pixelation
- Professional-quality output suitable for printing (up to 2000px)
- Better visual clarity on modern high-DPI displays (Retina, 4K)
- Optimized file sizes with high-quality compression
- **Payment Expiration UX**: `create_payment_onchain` includes `expires_at` timestamp
  - ISO 8601 format indicating exact payment deadline
  - Timer starts immediately when cryptocurrency address is generated
  - Consistent with `create_payment_link` behavior
  - Helps users and AI agents communicate time urgency effectively