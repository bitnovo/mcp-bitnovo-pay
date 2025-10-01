# OpenAI MCP Setup Guide

This guide shows you how to integrate the MCP Bitnovo Pay server with OpenAI's ChatGPT and related services.

## 📋 Prerequisites

- **Node.js 18+** installed
- **MCP Bitnovo Pay server** built and ready (`npm run build`)
- **OpenAI account** with API access
- **Bitnovo Pay credentials** (Device ID and optional Device Secret)

## ⚙️ Setup Methods

OpenAI supports MCP through multiple integration paths:

### 1. OpenAI Responses API (Recommended)

The Responses API is the easiest way to integrate MCP tools with OpenAI models.

#### Configuration

**Option 1: Using npx (Recommended - Always Latest Version)**:

```json
{
  "model": "gpt-4.1",
  "tools": [
    {
      "type": "mcp",
      "server_url": "stdio://npx -y @bitnovopay/mcp-bitnovo-pay",
      "server_label": "bitnovo-pay",
      "require_approval": "never",
      "allowed_tools": [
        "create_payment_onchain",
        "create_payment_redirect",
        "get_payment_status",
        "list_currencies_catalog",
        "generate_payment_qr"
      ]
    }
  ]
}
```

**Option 2: Using Local Installation** (use the configuration from [`configs/openai-config.json`](../../configs/openai-config.json)):

```json
{
  "model": "gpt-4.1",
  "tools": [
    {
      "type": "mcp",
      "server_url": "stdio://node /path/to/mcp-bitnovo-pay/dist/index.js",
      "server_label": "bitnovo-pay",
      "require_approval": "never",
      "allowed_tools": [
        "create_payment_onchain",
        "create_payment_redirect",
        "get_payment_status",
        "list_currencies_catalog",
        "generate_payment_qr"
      ]
    }
  ]
}
```

#### Environment Variables

Set these environment variables before starting:

```bash
export BITNOVO_DEVICE_ID="your_device_id_here"
export BITNOVO_BASE_URL="https://pos.bitnovo.com"  # Production
# export BITNOVO_BASE_URL="https://dev-payments.pre-bnvo.com"  # Development
export BITNOVO_DEVICE_SECRET="your_secret_here"  # Optional
```

#### API Usage Example

**Using npx**:
```python
import openai

# Configure your API call
response = openai.completions.create(
  model="gpt-4.1",
  tools=[{
    "type": "mcp",
    "server_url": "stdio://npx -y @bitnovopay/mcp-bitnovo-pay",
    "server_label": "bitnovo-pay",
    "require_approval": "never"
  }],
  messages=[{
    "role": "user",
    "content": "Create a Bitcoin payment for 50 euros"
  }]
)
```

**Using local installation**:
```python
import openai

# Configure your API call
response = openai.completions.create(
  model="gpt-4.1",
  tools=[{
    "type": "mcp",
    "server_url": "stdio://node /path/to/mcp-bitnovo-pay/dist/index.js",
    "server_label": "bitnovo-pay",
    "require_approval": "never"
  }],
  messages=[{
    "role": "user",
    "content": "Create a Bitcoin payment for 50 euros"
  }]
)
```

### 2. OpenAI Agents SDK (Python)

For more advanced integrations, use the OpenAI Agents SDK.

#### Installation

```bash
pip install openai-agents
```

#### Configuration

**Using npx (Recommended)**:
```python
from openai_agents import HostedMCPTool

# Create MCP tool
bitnovo_tool = HostedMCPTool(
    tool_config={
        "type": "mcp",
        "server_label": "bitnovo-pay",
        "server_url": "stdio://npx -y @bitnovopay/mcp-bitnovo-pay",
        "require_approval": "never",
        "allowed_tools": [
            "create_payment_onchain",
            "create_payment_redirect",
            "get_payment_status",
            "list_currencies_catalog",
            "generate_payment_qr"
        ]
    }
)

# Use in your agent
agent = Agent(tools=[bitnovo_tool])
```

**Using local installation**:
```python
from openai_agents import HostedMCPTool

# Create MCP tool
bitnovo_tool = HostedMCPTool(
    tool_config={
        "type": "mcp",
        "server_label": "bitnovo-pay",
        "server_url": "stdio://node /path/to/mcp-bitnovo-pay/dist/index.js",
        "require_approval": "never",
        "allowed_tools": [
            "create_payment_onchain",
            "create_payment_redirect",
            "get_payment_status",
            "list_currencies_catalog",
            "generate_payment_qr"
        ]
    }
)

# Use in your agent
agent = Agent(tools=[bitnovo_tool])
```

## 🚀 Quick Test

### 1. Build the MCP Server

```bash
cd /path/to/mcp-bitnovo-pay
npm install
npm run build
```

### 2. Test MCP Connection

```bash
# Test the MCP server directly
npm run test:mcp

# Should show available tools:
# - create_payment_onchain
# - create_payment_redirect
# - get_payment_status
# - list_currencies_catalog
# - generate_payment_qr
```

### 3. Test with OpenAI

Use this Python script to test the integration:

```python
import openai
import os

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Test payment creation
response = openai.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "user", "content": "List available cryptocurrencies for payments under 100 euros"}
    ],
    tools=[{
        "type": "mcp",
        "server_url": f"stdio://node {os.getcwd()}/dist/index.js",
        "server_label": "bitnovo-pay",
        "require_approval": "never"
    }]
)

print(response.choices[0].message.content)
```

## 🔧 Configuration Options

### Supported Models

MCP tools work with these OpenAI models:
- **GPT-5** (Latest, recommended - released August 2025)
- **GPT-5-mini** (Faster, lower cost variant)
- **GPT-5-nano** (Minimal latency variant)
- **GPT-4.1 series** (Previous generation)
- **GPT-4o series** (Available for paid users)
- **OpenAI o-series** (Reasoning models)

### Tool Approval Settings

- `"require_approval": "never"` - Automatic tool execution
- `"require_approval": "always"` - Manual approval required
- `"require_approval": "dangerous"` - Only dangerous tools need approval

### Environment Configuration

Create a `.env` file in your project:

```env
# Required
BITNOVO_DEVICE_ID=your_device_id_here
BITNOVO_BASE_URL=https://pos.bitnovo.com

# Optional
BITNOVO_DEVICE_SECRET=your_device_secret_here
NODE_ENV=production
LOG_LEVEL=info

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

## 🛠️ Common Use Cases

### 1. E-commerce Integration

```python
# Create a payment for an order
response = agent.run(
    "Create a Bitcoin payment for 75 euros for order #12345"
)
```

### 2. Payment Status Tracking

```python
# Check payment status
response = agent.run(
    "Check the status of payment abc-123-def-456"
)
```

### 3. Multi-Currency Support

```python
# Let customer choose cryptocurrency
response = agent.run(
    "Create a payment link for 150 euros that redirects to https://mystore.com/success"
)
```

### 4. QR Code Generation

```python
# Generate QR codes for payments
response = agent.run(
    "Generate a branded QR code for payment xyz-789 in 400x400 size"
)
```

## 🔍 Troubleshooting

### Common Issues

#### MCP Server Not Found
```bash
Error: Cannot find module '/path/to/mcp-bitnovo-pay/dist/index.js'
```

**Solution**: Ensure you've built the project and the path is correct:
```bash
npm run build
ls -la dist/index.js  # Should exist
```

#### Environment Variables Missing
```bash
Error: BITNOVO_DEVICE_ID is required
```

**Solution**: Set required environment variables:
```bash
export BITNOVO_DEVICE_ID="your_device_id"
export BITNOVO_BASE_URL="https://pos.bitnovo.com"
```

#### Permission Denied
```bash
Error: EACCES: permission denied, open '/path/to/dist/index.js'
```

**Solution**: Fix file permissions:
```bash
chmod +x dist/index.js
```

#### API Connection Issues
```bash
Error: Request failed with status code 401
```

**Solution**: Check your Bitnovo Pay credentials and network connectivity.

### Debug Mode

Enable verbose logging:

```bash
export LOG_LEVEL=debug
npm run test:mcp:verbose
```

## 📚 Next Steps

- Read the [API Tools Reference](../api/tools-reference.md) for detailed tool documentation
- Check [Usage Examples](../api/examples.md) for more use cases
- Review [Error Handling](../api/error-handling.md) for error management

## 🔗 Useful Links

- [OpenAI MCP Documentation](https://platform.openai.com/docs/mcp)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Bitnovo Pay API](https://pos.bitnovo.com/redoc)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-06-18)

---

**Need help?** Open an issue on [GitHub Issues](https://github.com/your-username/mcp-bitnovo-pay/issues)