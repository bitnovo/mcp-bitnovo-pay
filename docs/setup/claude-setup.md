# Claude MCP Setup Guide

This guide shows you how to integrate the MCP Bitnovo Pay server with Claude Desktop and Claude Code.

## 📋 Prerequisites

- **Node.js 18+** installed
- **Claude Desktop** or **Claude Code** installed
- **MCP Bitnovo Pay server** built and ready (`npm run build`)
- **Bitnovo Pay credentials** (Device ID and optional Device Secret)

## ⚙️ Setup Methods

Claude supports MCP through two main applications:

### 1. Claude Desktop (Recommended for General Use)

Claude Desktop provides the most user-friendly MCP integration experience.

#### Installation

1. Download Claude Desktop from [claude.ai/desktop](https://claude.ai/desktop)
2. Install and launch the application
3. Navigate to Settings → MCP Servers

#### Configuration

Create or edit your Claude Desktop configuration file:

**Location**:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Option 1: Using npx (Recommended - Always Latest Version)**:

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "@bitnovopay/mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret_here"
      }
    }
  }
}
```

**Option 2: Using Local Installation** (use the file from [`configs/claude_desktop_config.json`](../../configs/claude_desktop_config.json)):

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-bitnovo-pay/dist/index.js"],
      "cwd": "/absolute/path/to/mcp-bitnovo-pay",
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret_here"
      }
    }
  }
}
```

#### Environment Variables

**Option 1**: In the config file (as shown above)

**Option 2**: System environment variables:
```bash
export BITNOVO_DEVICE_ID="your_device_id_here"
export BITNOVO_BASE_URL="https://pos.bitnovo.com"
export BITNOVO_DEVICE_SECRET="your_device_secret_here"
```

### 2. Claude Code (VS Code Extension)

Claude Code integrates directly into VS Code for development workflows.

#### Installation

1. Install the Claude Code extension from VS Code Marketplace
2. Sign in to your Claude account

#### Configuration

Claude Code automatically detects `.mcp.json` files in your project root:

**Using npx (Recommended)**:
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "npx",
      "args": ["-y", "@bitnovopay/mcp-bitnovo-pay"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret_here"
      }
    }
  }
}
```

**Using Local Installation**:
```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-bitnovo-pay/dist/index.js"],
      "cwd": "/absolute/path/to/mcp-bitnovo-pay",
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id_here",
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret_here"
      }
    }
  }
}
```

#### CLAUDE.md Integration

Claude Code can use project-specific instructions. The existing [`CLAUDE.md`](../../CLAUDE.md) file contains specialized guidance for Claude Code interactions.

## 🚀 Quick Test

### 1. Build the MCP Server

```bash
cd /path/to/mcp-bitnovo-pay
npm install
npm run build

# Verify build
ls -la dist/index.js  # Should exist
```

### 2. Test MCP Server

```bash
# Test the MCP server directly
npm run test:mcp

# Expected output:
# ✓ MCP server started successfully
# ✓ 5 tools available:
#   - create_payment_onchain
#   - create_payment_redirect
#   - get_payment_status
#   - list_currencies_catalog
#   - generate_payment_qr
```

### 3. Test with Claude

**Claude Desktop**:
1. Restart Claude Desktop after configuration
2. Look for the 🔧 icon indicating MCP tools are available
3. Ask: *"What payment tools do you have available?"*

**Claude Code**:
1. Open VS Code with the project containing `.mcp.json`
2. Open Claude Code panel
3. Ask: *"List the available cryptocurrencies for payments under 50 euros"*

## 🛠️ Common Use Cases

### 1. E-commerce Integration

```
Create a Bitcoin payment for 25 euros for order #12345
```

**Claude Response**: Creates payment with Bitcoin address, QR code, and payment URI.

### 2. Payment Status Checking

```
Check the status of payment abc-123-def-456
```

**Claude Response**: Returns current payment status, amounts, and expiration details.

### 3. Multi-Currency Payments

```
Create a payment link for 100 euros that allows customer to choose cryptocurrency
```

**Claude Response**: Creates web payment URL with redirect handling.

### 4. Cryptocurrency Research

```
What cryptocurrencies can I accept for payments under 150 euros?
```

**Claude Response**: Lists filtered cryptocurrencies with limits and blockchain details.

### 5. QR Code Generation

```
Generate a large branded QR code for payment xyz-789-abc
```

**Claude Response**: Creates custom QR code with specified styling options.

## 🔧 Configuration Options

### Environment Variables

Create a `.env` file in your project root:

```env
# Required
BITNOVO_DEVICE_ID=your_device_id_here
BITNOVO_BASE_URL=https://pos.bitnovo.com

# Optional
BITNOVO_DEVICE_SECRET=your_device_secret_here
NODE_ENV=production
LOG_LEVEL=info
```

### Development vs Production

**Development** (use Bitnovo's test environment):
```json
{
  "env": {
    "BITNOVO_DEVICE_ID": "test_device_id",
    "BITNOVO_BASE_URL": "https://dev-payments.pre-bnvo.com",
    "NODE_ENV": "development"
  }
}
```

**Production** (use Bitnovo's live environment):
```json
{
  "env": {
    "BITNOVO_DEVICE_ID": "live_device_id",
    "BITNOVO_BASE_URL": "https://pos.bitnovo.com",
    "NODE_ENV": "production"
  }
}
```

### Claude-Specific Features

The MCP server includes Claude-optimized features:

- **Decision Tree**: Automatic tool selection based on user intent
- **Smart Defaults**: Optimized for common payment scenarios
- **Error Handling**: Claude-friendly error messages
- **Privacy**: Sensitive data automatically masked in responses

## 🔍 Troubleshooting

### Common Issues

#### MCP Server Not Loading
**Claude Desktop**: Check the configuration file location and syntax
**Claude Code**: Ensure `.mcp.json` is in the project root

#### Path Issues
```json
// ❌ Incorrect - relative path
"args": ["dist/index.js"]

// ✅ Correct - absolute path
"args": ["/full/path/to/mcp-bitnovo-pay/dist/index.js"]
```

#### Environment Variables Not Set
**Error**: `Error: BITNOVO_DEVICE_ID is required`

**Solution**: Add environment variables to the config:
```json
{
  "env": {
    "BITNOVO_DEVICE_ID": "your_actual_device_id"
  }
}
```

#### Server Build Issues
```bash
# Rebuild the server
npm run clean
npm install
npm run build

# Check TypeScript compilation
npm run lint
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x dist/index.js

# Verify Node.js can execute
node dist/index.js --version
```

### Debug Mode

Enable verbose logging in your configuration:

```json
{
  "env": {
    "LOG_LEVEL": "debug",
    "NODE_ENV": "development"
  }
}
```

### MCP Server Management

**Claude Desktop**:
- Settings → MCP Servers → View server status
- Restart Claude Desktop to reload configuration

**Claude Code**:
- Command Palette → "Claude: Reload MCP Servers"
- Check VS Code Output panel for MCP logs

## 📈 Advanced Configuration

### Multiple Environments

```json
{
  "mcpServers": {
    "bitnovo-pay-dev": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "BITNOVO_BASE_URL": "https://dev-payments.pre-bnvo.com"
      }
    },
    "bitnovo-pay-prod": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "BITNOVO_BASE_URL": "https://pos.bitnovo.com"
      }
    }
  }
}
```

### Security Best Practices

- Store sensitive credentials in environment variables
- Use different Device IDs for development and production
- Enable HMAC validation with Device Secret
- Monitor API usage and set rate limits
- Regularly rotate authentication credentials

## 📚 Next Steps

- Read the [API Tools Reference](../api/tools-reference.md) for detailed tool documentation
- Check [Usage Examples](../api/examples.md) for more use cases
- Review [Error Handling](../api/error-handling.md) for error management
- See the main [CLAUDE.md](../../CLAUDE.md) for Claude Code specific guidance

## 🔗 Useful Links

- [Claude Desktop Download](https://claude.ai/desktop)
- [Claude Code VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-dev)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)
- [Bitnovo Pay API Documentation](https://pos.bitnovo.com/redoc)

---

**Need help?** Open an issue on [GitHub Issues](https://github.com/your-username/mcp-bitnovo-pay/issues)