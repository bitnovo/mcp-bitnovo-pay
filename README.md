# MCP Bitnovo Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-2025--01--27-blue.svg)](https://modelcontextprotocol.io/)

**MCP server for Bitnovo Pay integration with AI agents**

A Model Context Protocol (MCP) server that provides AI agents with cryptocurrency payment capabilities through Bitnovo Pay API integration. This server enables AI models to create payments, check payment status, manage QR codes, and access cryptocurrency catalogs.

## 🚀 Features

- **8 MCP Tools** for comprehensive payment management:
  - `create_payment_onchain` - Generate cryptocurrency addresses for direct payments
  - `create_payment_link` - Create web payment URLs with redirect handling
  - `get_payment_status` - Query payment status with detailed information
  - `list_currencies_catalog` - Get supported cryptocurrencies with filtering
  - `generate_payment_qr` - Generate custom QR codes from existing payments
  - `get_webhook_events` - Query webhook events received in real-time
  - `get_webhook_url` - Get public webhook URL with configuration instructions
  - `get_tunnel_status` - Diagnose tunnel connection status

- **Automatic Webhook System** with 3 tunnel providers:
  - 🔗 **ngrok**: Free persistent URL (1 static domain per account)
  - 🌐 **zrok**: 100% free open-source with persistent URLs
  - 🏢 **manual**: For servers with public IP (N8N, Opal, VPS)

- **Multi-LLM Support** - Compatible with:
  - 🤖 **OpenAI ChatGPT** (GPT-5, GPT-4o, Responses API, Agents SDK)
  - 🧠 **Google Gemini** (Gemini 2.5 Flash/Pro Sept 2025, CLI, FastMCP)
  - 🔮 **Claude** (Claude Desktop, Claude Code)

- **High-Quality QR Codes** (v1.1.0+):
  - 📱 512px default resolution (up from 300px) for modern displays
  - 🖨️ Support up to 2000px for professional printing
  - ✨ Sharp edges with optimized interpolation algorithms
  - 🎨 Custom Bitnovo Pay branding with smooth logo scaling

- **Privacy by Default** - Sensitive data masked in logs, minimal data exposure
- **Secure** - HTTPS enforcement, HMAC signature validation, secure secret handling
- **Reliable** - Built-in retry logic, timeout handling, stateless operation

## 📋 Prerequisites

- **Node.js 18+**
- **Bitnovo Pay Account** with Device ID and optional Device Secret
- **Environment Configuration** (see setup guides below)

## ⚡ Quick Start

### 1. Get Your Bitnovo Credentials

1. Sign up at [Bitnovo Pay](https://www.bitnovo.com/pay)
2. Obtain your **Device ID** from the Bitnovo dashboard
3. (Optional) Generate a **Device Secret** for webhook signature validation

### 2. Configure Your MCP Client

Add this configuration to your MCP client config file:

**For Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

**For OpenAI ChatGPT** (see [OpenAI Setup Guide](docs/setup/openai-setup.md)):

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

### 3. Restart Your MCP Client

Restart Claude Desktop, ChatGPT, or your MCP client to load the server.

### 4. Test the Integration

Ask your AI assistant: *"Create a payment for 10 euros"*

---

## 📦 Installation Options

### Option A: Using npx (Recommended)

**No installation required!** The `npx` command automatically downloads and runs the latest version.

```bash
npx -y mcp-bitnovo-pay
```

**Advantages**:
- ✅ Always get the latest version
- ✅ No manual updates needed
- ✅ No local installation required
- ✅ Works immediately

### Option B: Clone Repository (For Development)

For contributors or advanced users who need to modify the code:

```bash
# Clone the repository
git clone https://github.com/bitnovo/mcp-bitnovo-pay.git
cd mcp-bitnovo-pay

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

**Advantages**:
- ✅ Full control of source code
- ✅ Ability to modify and test changes
- ✅ Ideal for contributing to the project


## 🔧 Configuration by LLM Platform

Choose your AI platform and follow the specific setup guide:

### Claude Desktop (Anthropic)

**Config File Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
**Guide**: [Claude Setup Guide](docs/setup/claude-setup.md)

**Basic Configuration**:
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

**With Webhooks** (for real-time payment notifications):
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret_hex",
        "WEBHOOK_ENABLED": "true",
        "TUNNEL_ENABLED": "true",
        "TUNNEL_PROVIDER": "ngrok",
        "NGROK_AUTHTOKEN": "your_ngrok_token",
        "NGROK_DOMAIN": "your-domain.ngrok-free.app"
      }
    }
  }
}
```

### OpenAI ChatGPT

**Guide**: [OpenAI Setup Guide](docs/setup/openai-setup.md)
**Supported**: GPT-5, GPT-4o, Responses API, Agents SDK

**Basic Configuration**:
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

### Google Gemini

**Guide**: [Gemini Setup Guide](docs/setup/gemini-setup.md)
**Supported**: Gemini 2.5 Flash/Pro (Sept 2025), CLI, FastMCP

**Basic Configuration**:
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BITNOVO_DEVICE_ID` | ✅ Yes | Your Bitnovo Pay device identifier | `12345678-abcd-1234-abcd-1234567890ab` |
| `BITNOVO_BASE_URL` | ✅ Yes | Bitnovo API endpoint | `https://pos.bitnovo.com` (production)<br>`https://payments.pre-bnvo.com` (development) |
| `BITNOVO_DEVICE_SECRET` | ⚠️ Optional | HMAC secret for webhook validation | `your_hex_secret` |
| `WEBHOOK_ENABLED` | ⚠️ Optional | Enable webhook server | `true` or `false` |
| `TUNNEL_ENABLED` | ⚠️ Optional | Auto-start tunnel for webhooks | `true` or `false` |
| `TUNNEL_PROVIDER` | ⚠️ Optional | Tunnel provider | `ngrok`, `zrok`, or `manual` |

> **Security Note**: Never commit credentials to version control. Use environment variables or secure secret management.

## 🛠️ MCP Tools Reference

### Payment Creation

#### `create_payment_onchain`
Creates a cryptocurrency payment with a specific address for direct transactions.

**Use when**: User specifies a cryptocurrency (Bitcoin, ETH, USDC, etc.)

```json
{
  "amount_eur": 50.0,
  "input_currency": "BTC",
  "notes": "Coffee payment"
}
```

#### `create_payment_link`
Creates a web-based payment URL where customers can choose their cryptocurrency.

**Use when**: Generic payment request without specific crypto mentioned (DEFAULT OPTION)

```json
{
  "amount_eur": 50.0,
  "url_ok": "https://mystore.com/success",
  "url_ko": "https://mystore.com/cancel",
  "notes": "Order #1234"
}
```

### Payment Management

#### `get_payment_status`
Retrieves current payment status with detailed information.

```json
{
  "identifier": "payment_id_here"
}
```

**Status Codes**:
- `NR` (Not Ready): Pre-payment created, no crypto assigned
- `PE` (Pending): Waiting for customer payment
- `AC` (Awaiting Completion): Crypto detected in mempool
- `CO` (Completed): Payment confirmed on blockchain
- `EX` (Expired): Payment time limit exceeded
- `CA` (Cancelled): Payment cancelled
- `FA` (Failed): Transaction failed to confirm

#### `list_currencies_catalog`
Gets available cryptocurrencies with optional amount-based filtering.

```json
{
  "filter_by_amount": 25.0
}
```

#### `generate_payment_qr`
Creates custom QR codes for existing payments with high-quality output.

```json
{
  "identifier": "payment_id_here",
  "qr_type": "both",
  "size": 512,
  "style": "branded"
}
```

**QR Types**:
- `address`: Crypto address only (customer enters amount manually)
- `payment_uri`: Address + amount included (recommended)
- `both`: Generate both types (recommended)
- `gateway_url`: QR of payment gateway URL

**QR Size Options** (v1.1.0+):
- **Default**: 512px (optimized for modern displays)
- **Range**: 100px - 2000px
- **Recommended sizes**:
  - `512px`: Mobile and web displays
  - `800-1200px`: Standard printing
  - `1600-2000px`: High-quality printing (posters, stands)

**Quality Improvements** (v1.1.0):
- ✨ Sharp edges with `nearest` kernel interpolation for QR patterns
- 🎯 High-quality logo scaling with `lanczos3` kernel
- 📦 PNG compression level 6 with adaptive filtering
- 🖼️ Default size increased from 300px to 512px for better clarity

### Webhook Tools

#### `get_webhook_events`
Query webhook events received in real-time from Bitnovo Pay API.

**Available when**: `WEBHOOK_ENABLED=true`

```json
{
  "identifier": "payment_id_here",
  "limit": 50,
  "validated_only": true
}
```

#### `get_webhook_url`
Get public webhook URL with configuration instructions for Bitnovo panel.

**Available when**: `WEBHOOK_ENABLED=true`

```json
{
  "validate": true
}
```

#### `get_tunnel_status`
Diagnose tunnel connection status (ngrok, zrok, or manual).

**Available when**: `WEBHOOK_ENABLED=true`

```json
{}
```

## 📚 Documentation

- **[API Tools Reference](docs/api/tools-reference.md)** - Detailed documentation for all MCP tools
- **[Usage Examples](docs/api/examples.md)** - Real-world usage examples
- **[Error Handling](docs/api/error-handling.md)** - Error codes and troubleshooting
- **[Webhook System](WEBHOOKS.md)** - Webhook configuration and tunnel management

## 🏗️ Development

### Available Scripts

```bash
npm run build        # Compile TypeScript to JavaScript
npm run dev          # Run development server with hot reload
npm start            # Start production server
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Architecture

```
┌─────────────────┐
│   MCP Tools     │ ← 8 tools: 5 payment + 3 webhook
│ (src/tools/)    │
├─────────────────┤
│   Services      │ ← Business logic: PaymentService, CurrencyService
│ (src/services/) │
├─────────────────┤
│   API Client    │ ← Bitnovo API integration with retry logic
│ (src/api/)      │
├─────────────────┤
│ Webhook Server  │ ← HTTP Express + Event Store + Tunnel Manager
│ (src/webhook-*) │
├─────────────────┤
│   Utilities     │ ← Logging, validation, error handling, crypto
│ (src/utils/)    │
└─────────────────┘
```

### Dual-Server Architecture

The MCP server can run two servers simultaneously:

```
┌─────────────────────────────────────────────────────────┐
│             MCP Bitnovo Pay Server                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────────┐ ┌────────────┐│
│  │ MCP Server   │  │ Webhook Server   │ │  Tunnel    ││
│  │ (stdio)      │  │ (HTTP :3000)     │ │  Manager   ││
│  └──────┬───────┘  └────────┬─────────┘ └──────┬─────┘│
│         │                   │                   │      │
│         │    Event Store    │     Public URL    │      │
│         │   (in-memory)     │   (ngrok/zrok)    │      │
│         └──────────┬────────┴──────────┬────────┘      │
└────────────────────┼───────────────────┼───────────────┘
                     │                   │
            ┌────────┴────────┐  ┌───────┴────────┐
            │                 │  │                │
       Claude Desktop   Bitnovo API    Tunnel Provider
       (MCP Tools)      (Webhooks)    (ngrok/zrok/manual)
```

## 🔒 Security

- **HTTPS Only** - All API calls use HTTPS
- **HMAC Validation** - Webhook signature verification with SHA-256
- **Replay Attack Prevention** - Nonce caching with 5-minute TTL
- **Data Privacy** - Sensitive information is masked in logs
- **No Rate Data** - Exchange rates not exposed to prevent inaccuracies
- **Stateless Design** - No local persistence, real-time API queries
- **Auto-reconnection** - Exponential backoff up to 10 retries for tunnels
- **Health Monitoring** - Connection verification every 60 seconds

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/bitnovo/mcp-bitnovo-pay/issues)
- **Bitnovo Support**: [https://www.bitnovo.com/](https://www.bitnovo.com/)
- **MCP Protocol**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

## 🌟 Related

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Official MCP specification
- **[Bitnovo Pay](https://www.bitnovo.com/pay)** - Cryptocurrency payment platform
- **[Bitnovo Pay - Documentation](https://bitnovo.gitbook.io/pay)** - Bitnovo Pay Official Documentation
- **[Bitnovo Pay - Documención en Español](https://bitnovo.gitbook.io/pay-es)** - Bitnovo Pay Documentación Oficial
- **[MCP SDK](https://github.com/modelcontextprotocol/sdk)** - Official MCP SDK for TypeScript
