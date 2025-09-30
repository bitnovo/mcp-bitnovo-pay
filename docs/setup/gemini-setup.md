# Google Gemini MCP Setup Guide

This guide shows you how to integrate the MCP Bitnovo Pay server with Google Gemini using Gemini CLI and FastMCP.

## 📋 Prerequisites

- **Node.js 18+** installed
- **Python 3.8+** installed (for FastMCP)
- **MCP Bitnovo Pay server** built and ready (`npm run build`)
- **Google Cloud account** with Gemini API access
- **Bitnovo Pay credentials** (Device ID and optional Device Secret)

## ⚙️ Setup Methods

Google Gemini supports MCP through two main integration paths:

### 1. Gemini CLI (Recommended)

The Gemini CLI is the official way to integrate MCP servers with Gemini models.

#### Installation

```bash
# Install Gemini CLI globally
npm install -g @google/gemini-cli@latest

# Verify installation
gemini --version
```

#### Authentication Setup

```bash
# Set up your Google Cloud credentials
export GOOGLE_API_KEY="your_gemini_api_key"

# Or use Google Cloud authentication
gcloud auth login
gcloud auth application-default login
```

#### MCP Server Registration

```bash
# Navigate to your MCP server directory
cd /path/to/mcp-bitnovo-pay

# Build the server
npm run build

# Add MCP server to Gemini CLI
gemini mcp add bitnovo-pay \
  --command "node" \
  --args "dist/index.js" \
  --env BITNOVO_DEVICE_ID="your_device_id" \
  --env BITNOVO_BASE_URL="https://pos.bitnovo.com" \
  --env BITNOVO_DEVICE_SECRET="your_secret"

# Enable the MCP server
gemini mcp enable bitnovo-pay

# Verify the server is registered
gemini mcp list
```

#### Usage

```bash
# Start a chat session with MCP tools
gemini chat --mcp bitnovo-pay

# Example interactions:
# "Create a Bitcoin payment for 50 euros"
# "List available cryptocurrencies under 100 euros"
# "Generate a QR code for payment abc-123-def"
```

### 2. FastMCP Integration (Python)

For Python developers, FastMCP provides a streamlined way to work with MCP servers.

#### Installation

```bash
# Install FastMCP
pip install fastmcp>=2.12.3

# Install Gemini CLI integration
fastmcp install gemini-cli
```

#### Configuration

```python
from fastmcp import FastMCP
import os

# Configure environment
os.environ['BITNOVO_DEVICE_ID'] = 'your_device_id'
os.environ['BITNOVO_BASE_URL'] = 'https://pos.bitnovo.com'
os.environ['BITNOVO_DEVICE_SECRET'] = 'your_secret'  # Optional

# Install MCP server
fastmcp.install('bitnovo-pay', {
    'command': 'node',
    'args': ['/path/to/mcp-bitnovo-pay/dist/index.js'],
    'env': {
        'BITNOVO_DEVICE_ID': os.environ['BITNOVO_DEVICE_ID'],
        'BITNOVO_BASE_URL': os.environ['BITNOVO_BASE_URL'],
        'BITNOVO_DEVICE_SECRET': os.environ.get('BITNOVO_DEVICE_SECRET', '')
    }
})

# Use with Gemini
from google.generativeai import GenerativeModel

model = GenerativeModel('gemini-2.5-pro')
response = model.generate_content(
    "Create a Bitcoin payment for 75 euros",
    tools=fastmcp.get_tools('bitnovo-pay')
)
```

## 🚀 Quick Test

### 1. Build and Test MCP Server

```bash
cd /path/to/mcp-bitnovo-pay
npm install
npm run build

# Test MCP server directly
npm run test:mcp

# Should list 5 available tools
```

### 2. Test with Gemini CLI

```bash
# Set environment variables
export BITNOVO_DEVICE_ID="your_device_id"
export BITNOVO_BASE_URL="https://pos.bitnovo.com"
export GOOGLE_API_KEY="your_gemini_api_key"

# Test interaction
gemini chat --mcp bitnovo-pay --prompt "List supported cryptocurrencies"
```

### 3. Test with Python

```python
import google.generativeai as genai
import os

# Configure Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Set up environment
os.environ['BITNOVO_DEVICE_ID'] = 'your_device_id'
os.environ['BITNOVO_BASE_URL'] = 'https://pos.bitnovo.com'

# Create model with MCP tools (using latest model)
model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')

# Test payment creation
response = model.generate_content([
    "Create a payment link for 100 euros that redirects to https://example.com/success"
])

print(response.text)
```

## 🔧 Configuration Options

### Supported Gemini Models

The MCP server works with these Gemini models (September 2025 update):
- **gemini-2.5-flash-preview-09-2025** (Latest, recommended - improved agentic tool use)
- **gemini-2.5-flash-lite-preview-09-2025** (Most cost-efficient, 50% reduction in tokens)
- **gemini-2.5-pro** (Best reasoning with thinking capabilities)
- **gemini-2.0-flash** (Agentic era model with 1M token context)
- **gemini-1.5-pro** (Stable)
- **gemini-1.5-flash** (Lightweight)

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

# Google Gemini
GOOGLE_API_KEY=your_gemini_api_key_here
```

### MCP Server Configuration

Use the configuration from [`configs/gemini-config.json`](../../configs/gemini-config.json) as a reference.

## 🛠️ Common Use Cases

### 1. Payment Creation with Gemini CLI

```bash
gemini chat --mcp bitnovo-pay

# User: "I need to create a Bitcoin payment for my coffee shop. The coffee costs 4.50 euros."
# Gemini: [Creates payment and returns Bitcoin address with QR code]
```

### 2. Payment Tracking

```python
# Check payment status
response = model.generate_content(
    "What's the status of payment identifier abc-123-def-456?",
    tools=mcp_tools
)
```

### 3. Multi-Currency Exploration

```bash
# User: "Show me all cryptocurrencies I can accept for payments under 50 euros"
# Gemini: [Lists filtered cryptocurrencies with limits and details]
```

### 4. QR Code Generation

```python
# Generate branded QR code
response = model.generate_content([
    "Generate a large branded QR code for payment xyz-789",
    "Make it 500x500 pixels"
])
```

## 🎨 Advanced Features

### Multimodal Responses

Gemini can return rich responses including images (QR codes):

```json
{
  "content": [
    {
      "type": "text",
      "text": "Here's your Bitcoin payment QR code:"
    },
    {
      "type": "image",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "Payment address: bc1q..."
    }
  ]
}
```

### Function Calling

Gemini automatically detects when to use MCP tools based on natural language:

```bash
# User: "bitcoin payment 25 euros"
# Gemini automatically calls: create_payment_onchain(amount_eur=25, input_currency="BTC")
```

### Structured Output

Gemini can provide structured responses:

```python
# Request structured payment info
prompt = """
Create a Bitcoin payment for 100 euros and format the response as JSON with:
- payment_id
- bitcoin_address
- qr_code_url
- expiration_time
"""
```

## 🔍 Troubleshooting

### Common Issues

#### Gemini CLI Not Found
```bash
command not found: gemini
```

**Solution**: Install Gemini CLI globally:
```bash
npm install -g @google/gemini-cli@latest
```

#### MCP Server Registration Failed
```bash
Error: Failed to register MCP server
```

**Solution**: Check the server builds correctly and paths are absolute:
```bash
npm run build
gemini mcp add bitnovo-pay --command "node" --args "$(pwd)/dist/index.js"
```

#### Authentication Issues
```bash
Error: Invalid API key
```

**Solution**: Set up Gemini API key:
```bash
export GOOGLE_API_KEY="your_actual_api_key"
# Or use gcloud auth
gcloud auth application-default login
```

#### Environment Variables Not Set
```bash
Error: BITNOVO_DEVICE_ID is required
```

**Solution**: Export environment variables before running:
```bash
export BITNOVO_DEVICE_ID="your_device_id"
export BITNOVO_BASE_URL="https://pos.bitnovo.com"
```

### Debug Mode

Enable verbose logging:

```bash
# Debug Gemini CLI
export DEBUG=1
gemini chat --mcp bitnovo-pay --verbose

# Debug MCP server
export LOG_LEVEL=debug
npm run test:mcp:verbose
```

### MCP Server Management

```bash
# List all registered MCP servers
gemini mcp list

# Enable/disable servers
gemini mcp enable bitnovo-pay
gemini mcp disable bitnovo-pay

# Remove server
gemini mcp remove bitnovo-pay

# Update server configuration
gemini mcp update bitnovo-pay --env BITNOVO_BASE_URL="https://new-url.com"
```

## 📚 Next Steps

- Read the [API Tools Reference](../api/tools-reference.md) for detailed tool documentation
- Check [Usage Examples](../api/examples.md) for more use cases
- Review [Error Handling](../api/error-handling.md) for error management

## 🔗 Useful Links

- [Gemini CLI Documentation](https://google-gemini.github.io/gemini-cli/)
- [FastMCP Documentation](https://docs.fastmcp.com/)
- [Google Gemini API](https://ai.google.dev/gemini-api)
- [MCP with Gemini Tutorial](https://codelabs.developers.google.com/cloud-gemini-cli-mcp-go)
- [Bitnovo Pay API](https://pos.bitnovo.com/redoc)

---

**Need help?** Open an issue on [GitHub Issues](https://github.com/your-username/mcp-bitnovo-pay/issues)