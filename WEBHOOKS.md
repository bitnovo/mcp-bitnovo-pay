# Webhook Integration Guide

This guide explains how to configure and use webhooks with MCP Bitnovo Pay to receive real-time payment notifications.

## Overview

The MCP Bitnovo Pay server can run in **dual-server mode**:
- **MCP Stdio Server** (port: IPC) - Communicates with Claude Desktop via stdio
- **HTTP Webhook Server** (port: 3000 by default) - Receives webhooks from Bitnovo Pay API
- **Tunnel Manager** (optional) - Automatically provides public URL using ngrok, zrok, or manual configuration

Webhooks provide real-time payment status updates, eliminating the need for polling with `get_payment_status`.

## Architecture

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

## Quick Start

### Scenario 1: Local Development (Auto-Tunnel)

The easiest setup - tunnel is **automatically configured** based on your environment:

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "command": "node",
      "args": ["/path/to/mcp-bitnovo-pay/dist/index.js"],
      "env": {
        "BITNOVO_DEVICE_ID": "your_device_id",
        "BITNOVO_BASE_URL": "https://dev-payments.pre-bnvo.com",
        "BITNOVO_DEVICE_SECRET": "your_device_secret",
        "WEBHOOK_ENABLED": "true",
        "TUNNEL_ENABLED": "true",
        "TUNNEL_PROVIDER": "ngrok",
        "NGROK_AUTHTOKEN": "your_ngrok_token",
        "NGROK_DOMAIN": "bitnovo-dev.ngrok-free.app"
      }
    }
  }
}
```

**Get your webhook URL:**
- Use the MCP tool: `get_webhook_url`
- Returns: `https://bitnovo-dev.ngrok-free.app/webhook/bitnovo`
- Configure this URL in Bitnovo Dashboard
- URL is **persistent** (doesn't change on restart)

### Scenario 2: N8N/Opal/VPS (Manual URL)

For servers with public IP addresses:

```json
{
  "mcpServers": {
    "bitnovo-pay": {
      "env": {
        "WEBHOOK_ENABLED": "true",
        "TUNNEL_ENABLED": "false",
        "WEBHOOK_PUBLIC_URL": "https://n8n.empresa.com"
      }
    }
  }
}
```

The system auto-detects N8N/Opal/VPS environments and uses the manual provider automatically.

### Scenario 3: Production Deployment

For production servers with reverse proxy:

```json
{
  "env": {
    "WEBHOOK_ENABLED": "true",
    "TUNNEL_ENABLED": "false",
    "WEBHOOK_PUBLIC_URL": "https://webhooks.yourdomain.com"
  }
}
```

## Tunnel Providers

### Provider Comparison

| Provider | Cost | Persistent URL | Best For | Stability |
|----------|------|----------------|----------|-----------|
| **ngrok** | Free (1 static domain) | ✅ Yes | Local development | ~99% uptime |
| **zrok** | Free | ✅ Yes (reserved shares) | Open-source preference | Medium-high |
| **manual** | Depends on hosting | ✅ Yes | Servers with public IP | Server-dependent |

### Provider 1: ngrok (Recommended for Local Development)

**Features:**
- ✅ **Free static domain** (1 per account since 2023)
- ✅ **Persistent URL** (doesn't change on restart)
- ✅ **High reliability** (~99% uptime)
- ✅ **24-hour session timeout** (auto-reconnect handles this)

**Setup:**

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup)
2. Get your authtoken from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Claim your free static domain at [domains page](https://dashboard.ngrok.com/cloud-edge/domains)

**Configuration:**

```bash
TUNNEL_ENABLED=true
TUNNEL_PROVIDER=ngrok
NGROK_AUTHTOKEN=2abc123def456ghi789jkl
NGROK_DOMAIN=bitnovo-dev.ngrok-free.app  # Your free static domain

# Optional: Reconnection settings
TUNNEL_HEALTH_CHECK_INTERVAL=60000        # 1 minute
TUNNEL_RECONNECT_MAX_RETRIES=10
TUNNEL_RECONNECT_BACKOFF_MS=5000          # 5 seconds
```

**Get Webhook URL:**

After starting the server, use the MCP tool:
```
get_webhook_url
```

Returns:
```json
{
  "webhook_url": "https://bitnovo-dev.ngrok-free.app/webhook/bitnovo",
  "provider": "ngrok",
  "validated": true,
  "instructions": "✅ ngrok tunnel active with persistent URL..."
}
```

### Provider 2: zrok (Open-Source Alternative)

**Features:**
- ✅ **100% Free** (no limits on reserved shares)
- ✅ **Persistent URL** with unique-name
- ✅ **Open-source** (built on OpenZiti)
- ✅ **Medium-high stability** (improving with recent releases)

**Setup:**

1. Sign up at [myzrok.io](https://myzrok.io)
2. Install zrok CLI:
   ```bash
   # macOS
   brew install openziti/zrok/zrok

   # Linux
   curl -sSLf https://get.zrok.io/install.sh | bash
   ```
3. Enable account:
   ```bash
   zrok enable YOUR_TOKEN_FROM_MYZROK
   ```
4. Reserve a share with unique name:
   ```bash
   zrok reserve public --unique-name bitnovo-webhooks 3000
   ```

**Configuration:**

```bash
TUNNEL_ENABLED=true
TUNNEL_PROVIDER=zrok
ZROK_TOKEN=your_zrok_token
ZROK_UNIQUE_NAME=bitnovo-webhooks  # Your reserved share name

# Results in persistent URL:
# https://bitnovo-webhooks.share.zrok.io/webhook/bitnovo
```

**Advantages:**
- No session timeouts
- Zero-trust networking built-in
- Self-hosting option available
- Active community support

### Provider 3: Manual (Servers with Public IP)

**Best For:**
- N8N instances
- Opal deployments
- VPS/cloud servers
- Docker with ingress
- Kubernetes with LoadBalancer

**Auto-Detection:**

The system automatically detects these environments and switches to manual provider:

| Environment | Detection Method |
|-------------|------------------|
| **N8N** | `N8N_HOST` or `N8N_PROTOCOL` env vars |
| **Opal** | `OPAL_WEBHOOK_URL` or `OPAL_HOST` env vars |
| **Kubernetes** | `KUBERNETES_SERVICE_HOST` env var |
| **Docker** | `/.dockerenv` file or `DOCKER_HOST` |
| **VPS/Server** | Multiple server indicators (systemd, PM2, etc.) |

**Configuration:**

```bash
WEBHOOK_ENABLED=true
TUNNEL_ENABLED=false  # or TUNNEL_PROVIDER=manual
WEBHOOK_PUBLIC_URL=https://n8n.empresa.com  # Your server's public URL
```

Or let the system auto-detect and set `WEBHOOK_PUBLIC_URL` from environment:
- N8N: Uses `N8N_HOST` + `N8N_PROTOCOL`
- Opal: Uses `OPAL_WEBHOOK_URL` or `OPAL_HOST`
- Kubernetes: Uses `INGRESS_HOST` or `PUBLIC_URL`

## Configuration Reference

### Complete Environment Variables

```bash
# === Core Configuration ===
BITNOVO_DEVICE_ID=your_device_id_here
BITNOVO_BASE_URL=https://pos.bitnovo.com
BITNOVO_DEVICE_SECRET=your_device_secret_here

# === Webhook Configuration ===
WEBHOOK_ENABLED=true
WEBHOOK_PORT=3000
WEBHOOK_HOST=0.0.0.0
WEBHOOK_PATH=/webhook/bitnovo

# Event store
WEBHOOK_MAX_EVENTS=1000
WEBHOOK_EVENT_TTL_MS=3600000  # 1 hour

# === Tunnel Configuration ===
TUNNEL_ENABLED=true
TUNNEL_PROVIDER=ngrok  # Options: ngrok, zrok, manual

# ngrok specific
NGROK_AUTHTOKEN=your_ngrok_token
NGROK_DOMAIN=bitnovo-dev.ngrok-free.app  # Optional: your free static domain

# zrok specific
ZROK_TOKEN=your_zrok_token
ZROK_UNIQUE_NAME=bitnovo-webhooks  # Your reserved share name

# manual provider
WEBHOOK_PUBLIC_URL=https://n8n.empresa.com  # For manual provider

# Health monitoring and reconnection
TUNNEL_HEALTH_CHECK_INTERVAL=60000       # 60 seconds (default)
TUNNEL_RECONNECT_MAX_RETRIES=10          # Max retry attempts
TUNNEL_RECONNECT_BACKOFF_MS=5000         # Initial backoff delay
```

## MCP Tools

### 1. get_webhook_url

Returns the public webhook URL with setup instructions.

**Usage:**
```typescript
{
  "name": "get_webhook_url",
  "arguments": {
    "validate": true  // Optional: checks if URL is publicly accessible
  }
}
```

**Response:**
```json
{
  "webhook_url": "https://bitnovo-dev.ngrok-free.app/webhook/bitnovo",
  "provider": "ngrok",
  "validated": true,
  "instructions": "✅ ngrok tunnel active with persistent URL.\n\nConfiguration steps:\n1. Copy this webhook URL: https://bitnovo-dev.ngrok-free.app/webhook/bitnovo\n2. Log into https://pay.bitnovo.com\n3. Go to: Settings → Merchant → Devices\n4. Select your device\n5. Set \"notification_url\" to: https://bitnovo-dev.ngrok-free.app/webhook/bitnovo\n\nNote: This ngrok URL is persistent and will not change between restarts (using free static domain)."
}
```

### 2. get_tunnel_status

Returns detailed tunnel connection status and diagnostics.

**Usage:**
```typescript
{
  "name": "get_tunnel_status",
  "arguments": {}
}
```

**Response:**
```json
{
  "enabled": true,
  "provider": "ngrok",
  "status": "connected",
  "public_url": "https://bitnovo-dev.ngrok-free.app",
  "connected_at": "2025-09-30T10:30:00.000Z",
  "last_error": null,
  "reconnect_attempts": 0,
  "health_check_enabled": true,
  "context_detected": {
    "execution_context": "local",
    "confidence": 0.7,
    "suggested_provider": "ngrok",
    "indicators": [
      "Local development environment detected"
    ]
  }
}
```

**Connection Statuses:**
- `disconnected`: Tunnel not started
- `connecting`: Tunnel initializing
- `connected`: Tunnel active and healthy
- `reconnecting`: Lost connection, attempting to reconnect
- `error`: Failed after max reconnection attempts

### 3. get_webhook_events

Query stored webhook notifications (existing tool).

**Usage:**
```typescript
{
  "name": "get_webhook_events",
  "arguments": {
    "identifier": "abc-123",  // Optional: filter by payment ID
    "limit": 50,              // Max events to return
    "validated_only": true    // Only HMAC-validated events
  }
}
```

## Typical Workflows

### Workflow 1: Local Development Setup

1. **Install ngrok and authenticate:**
   ```bash
   brew install ngrok
   ngrok config add-authtoken YOUR_TOKEN
   ```

2. **Claim free static domain** at [ngrok domains](https://dashboard.ngrok.com/cloud-edge/domains)

3. **Configure MCP server** with tunnel:
   ```json
   {
     "env": {
       "WEBHOOK_ENABLED": "true",
       "TUNNEL_ENABLED": "true",
       "TUNNEL_PROVIDER": "ngrok",
       "NGROK_AUTHTOKEN": "your_token",
       "NGROK_DOMAIN": "bitnovo-dev.ngrok-free.app"
     }
   }
   ```

4. **Start server** (tunnel starts automatically)

5. **Get webhook URL:**
   ```
   Use MCP tool: get_webhook_url
   ```

6. **Configure in Bitnovo Dashboard:**
   - Go to Settings → Merchant → Devices
   - Set notification_url to returned webhook URL

7. **Test payment:**
   ```
   Use MCP tool: create_payment_link
   Check webhook events: get_webhook_events
   ```

### Workflow 2: N8N Deployment

1. **Deploy MCP server on N8N:**
   - MCP server auto-detects N8N environment
   - Uses `N8N_HOST` environment variable

2. **Configure:**
   ```json
   {
     "env": {
       "WEBHOOK_ENABLED": "true"
       // System auto-detects and uses manual provider
     }
   }
   ```

3. **Get webhook URL:**
   ```
   Use MCP tool: get_webhook_url
   Returns: https://your-n8n-instance.com/webhook/bitnovo
   ```

4. **Configure in Bitnovo Dashboard**

### Workflow 3: Production VPS

1. **Setup reverse proxy** (nginx/caddy)

2. **Configure SSL certificate** (Let's Encrypt)

3. **Configure MCP server:**
   ```json
   {
     "env": {
       "WEBHOOK_ENABLED": "true",
       "TUNNEL_ENABLED": "false",
       "WEBHOOK_PUBLIC_URL": "https://webhooks.yourdomain.com"
     }
   }
   ```

4. **nginx configuration:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name webhooks.yourdomain.com;

       location /webhook/bitnovo {
           proxy_pass http://localhost:3000/webhook/bitnovo;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_request_buffering off;
       }
   }
   ```

## Security

### HMAC Signature Validation

All webhooks are validated using HMAC-SHA256:

```
signature = hex(hmac_sha256(device_secret, nonce + raw_body))
```

**Headers received:**
- `X-NONCE`: Timestamp-based nonce
- `X-SIGNATURE`: HMAC signature

**Validation process:**
1. Extract nonce and signature from headers
2. Compute expected signature using device_secret
3. Compare using timing-safe comparison
4. Reject if signatures don't match (401 Unauthorized)

### Replay Attack Prevention

- **Nonce cache**: Stores used nonces for 5 minutes
- **Duplicate detection**: Rejects webhooks with already-used nonces
- **Event deduplication**: Same payment event received multiple times is stored once

### Why Public URLs Are Safe

**Question:** "Won't malicious actors send fake webhooks to my public URL?"

**Answer:** No, because:
1. **HMAC validation** ensures only Bitnovo (with your device_secret) can create valid signatures
2. Without the device_secret, attackers cannot generate valid signatures
3. All requests without valid signatures are rejected (401 Unauthorized)
4. Nonce replay prevention stops reusing captured valid requests

**Security Model:**
```
Attacker sends fake webhook → Missing/invalid signature → 401 Rejected ✅
Attacker replays captured webhook → Nonce already used → 401 Rejected ✅
Bitnovo sends webhook → Valid signature + fresh nonce → 200 Accepted ✅
```

### Security Best Practices

1. ✅ **Always use HTTPS** in production
2. ✅ **Keep BITNOVO_DEVICE_SECRET secure** (environment variables only, never commit to git)
3. ✅ **Use validated_only=true** when querying critical operations
4. ✅ **Monitor failed webhook attempts** in logs
5. ✅ **Rotate device_secret periodically**
6. ✅ **Use firewall** to restrict HTTP access (only allow Bitnovo IPs if needed)

## Troubleshooting

### Tunnel Not Starting

**Symptom:** Server starts but tunnel shows "disconnected"

**Solutions:**

1. **Check provider configuration:**
   ```bash
   # For ngrok
   echo $NGROK_AUTHTOKEN  # Should not be empty

   # For zrok
   zrok test  # Verify zrok CLI works
   ```

2. **Check logs:**
   ```
   Look for "Tunnel started successfully" in server logs
   If missing, check for "Failed to start tunnel" errors
   ```

3. **Verify provider status:**
   ```
   Use MCP tool: get_tunnel_status
   Check "last_error" field for details
   ```

4. **Test tunnel manually:**
   ```bash
   # ngrok
   ngrok http 3000 --domain=bitnovo-dev.ngrok-free.app

   # zrok
   zrok share reserved bitnovo-webhooks
   ```

### Webhooks Not Receiving

**Symptom:** Payment created but no webhook events

**Solutions:**

1. **Check webhook server is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify WEBHOOK_ENABLED=true** in config

3. **Check notification_url in Bitnovo Dashboard:**
   - Must match output from `get_webhook_url`
   - Must include `/webhook/bitnovo` path

4. **Check tunnel status:**
   ```
   Use MCP tool: get_tunnel_status
   Ensure status is "connected"
   ```

5. **Verify firewall/port forwarding** (for manual provider)

6. **Check logs** for webhook processing errors

### Signature Validation Failing

**Symptom:** Webhooks rejected with 401 "Invalid webhook signature"

**Solutions:**

1. **Verify BITNOVO_DEVICE_SECRET matches dashboard:**
   ```bash
   echo $BITNOVO_DEVICE_SECRET
   # Should be 64-character hex string
   ```

2. **Check device_secret format:**
   - Must be exactly 64 hex characters
   - No spaces, no prefix like "0x"

3. **Ensure raw body preservation:**
   - Reverse proxies must not modify request body
   - nginx: use `proxy_request_buffering off;`

4. **Check logs:**
   ```
   Look for "HMAC signature validation failed"
   Verify nonce format and length
   ```

### Tunnel Keeps Disconnecting

**Symptom:** Tunnel status shows "reconnecting" frequently

**Solutions:**

1. **Check internet connection stability**

2. **Increase health check interval:**
   ```bash
   TUNNEL_HEALTH_CHECK_INTERVAL=120000  # 2 minutes instead of 1
   ```

3. **Switch tunnel provider:**
   ```bash
   # From ngrok to zrok, or vice versa
   TUNNEL_PROVIDER=zrok
   ```

4. **Check provider service status:**
   - ngrok: [status.ngrok.com](https://status.ngrok.com)
   - zrok: [status.zrok.io](https://status.zrok.io) (if exists)

5. **Review reconnection logs:**
   ```
   Look for "Tunnel reconnection failed" in server logs
   Check "reconnect_attempts" in get_tunnel_status
   ```

## Performance

### Event Store

- **Storage**: In-memory (fast, no persistence)
- **Capacity**: 1000 events (configurable)
- **TTL**: 1 hour (configurable)
- **Cleanup**: Automatic every 5 minutes
- **Indexing**: Fast lookup by payment identifier

### HTTP Server

- **Timeouts**: 5s default
- **Body limit**: 1MB
- **Rate limiting**: Recommended in production (nginx/caddy)
- **Concurrent requests**: Node.js default

### Tunnel Performance

- **ngrok**: ~99% uptime, ~10-50ms added latency
- **zrok**: Medium-high uptime, ~20-100ms added latency
- **manual**: Server-dependent, no tunnel overhead

### Memory Usage

**Event Store:**
- Estimated memory per event: ~2KB
- 1000 events ≈ 2MB
- 10000 events ≈ 20MB

**Tunnel Manager:**
- ngrok: ~5-10MB overhead
- zrok: ~10-20MB overhead (includes OpenZiti)
- manual: ~0MB (no tunnel process)

## Advanced Topics

### Custom Tunnel Configuration

**Override auto-detection:**
```bash
TUNNEL_ENABLED=true
TUNNEL_PROVIDER=ngrok

# Force manual provider even if auto-detection suggests tunnel
TUNNEL_ENABLED=false
WEBHOOK_PUBLIC_URL=https://custom.domain.com
```

### Health Monitoring Integration

**Prometheus-style metrics** (via /stats endpoint):
```bash
curl http://localhost:3000/stats
```

**Response includes:**
- Event store statistics
- Webhook handler statistics
- Nonce cache size
- Tunnel status (if enabled)

### Multiple Environments

**Development:**
```bash
TUNNEL_PROVIDER=ngrok
NGROK_DOMAIN=bitnovo-dev.ngrok-free.app
```

**Staging:**
```bash
TUNNEL_PROVIDER=zrok
ZROK_UNIQUE_NAME=bitnovo-staging
```

**Production:**
```bash
TUNNEL_ENABLED=false
WEBHOOK_PUBLIC_URL=https://webhooks.production.com
```

## API Reference

### POST /webhook/bitnovo

**Headers:**
- `X-NONCE`: string (required)
- `X-SIGNATURE`: string (required)
- `Content-Type`: application/json

**Body:** Payment status payload (see PaymentSerializer)

**Responses:**
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid payload/signature
- `401 Unauthorized`: Signature validation failed
- `500 Internal Server Error`: Processing error

### GET /health

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "webhook": {
    "enabled": true,
    "path": "/webhook/bitnovo"
  },
  "eventStore": {
    "totalEvents": 42,
    "uniqueIdentifiers": 15,
    "validatedCount": 40,
    "invalidatedCount": 2
  },
  "handler": {
    "noncesCached": 38,
    "hasDeviceSecret": true
  }
}
```

### GET /stats

**Response:** Detailed statistics about event store and handler

## Changelog

### v1.1.0 (2025-09-30) - Tunnel System

- ✅ **Automatic tunnel management** with 3 providers (ngrok, zrok, manual)
- ✅ **Context auto-detection** (N8N, Opal, Docker, Kubernetes, VPS, local)
- ✅ **Persistent URLs** with ngrok free static domains and zrok reserved shares
- ✅ **Auto-reconnect** with exponential backoff (up to 10 retries)
- ✅ **Health monitoring** every 60 seconds with automatic recovery
- ✅ **New MCP tools**: `get_webhook_url`, `get_tunnel_status`
- ✅ **Zero configuration** for common deployment scenarios

### v1.0.0 (2025-09-30) - Initial Webhook Implementation

- ✅ Initial webhook implementation
- ✅ Event store (in-memory)
- ✅ HMAC signature validation
- ✅ Replay attack prevention
- ✅ Dual-server mode (stdio + HTTP)
- ✅ New MCP tool: get_webhook_events
- ✅ Health check and stats endpoints

## Support

For issues or questions:
- GitHub Issues: https://github.com/bitnovo/mcp-bitnovo-pay/issues
- Email: support@bitnovo.com
- Documentation: https://bitnovo.gitbook.io/pay/

## Resources

**Tunnel Providers:**
- ngrok: [ngrok.com](https://ngrok.com) | [docs](https://ngrok.com/docs)
- zrok: [zrok.io](https://zrok.io) | [docs](https://docs.zrok.io)

**Bitnovo:**
- Dashboard: [pay.bitnovo.com](https://pay.bitnovo.com)
- API Docs: [bitnovo.gitbook.io/pay](https://bitnovo.gitbook.io/pay/)
- Support: support@bitnovo.com