# MCP Tools Reference

Complete reference for all MCP tools provided by the Bitnovo Pay server.

## Overview

The MCP Bitnovo Pay server provides 5 specialized tools for cryptocurrency payment management:

| Tool | Purpose | Use When |
|------|---------|----------|
| `create_payment_onchain` | Crypto-specific payments | User mentions specific cryptocurrency |
| `create_payment_redirect` | Generic web payments | No specific crypto mentioned (DEFAULT) |
| `get_payment_status` | Payment tracking | Check payment state |
| `list_currencies_catalog` | Currency discovery | Explore payment options |
| `generate_payment_qr` | QR code generation | Create custom QR codes |

## Tool Selection Decision Tree

### 🔍 CRITICAL RULE: Does user mention a specific cryptocurrency?

#### ✅ User mentions specific crypto → `create_payment_onchain`
- **Examples**: "Bitcoin payment", "BTC for 50 euros", "Generate ETH address", "I need USDC QR"
- **Result**: Fixed cryptocurrency address, customer must pay in that specific crypto

#### ✅ No specific crypto mentioned → `create_payment_redirect` (DEFAULT)
- **Examples**: "Payment for 50 euros", "Create payment", "dame el qr para 24 euros", "Payment link"
- **Result**: Web URL where customer can choose any supported cryptocurrency

---

## 🪙 create_payment_onchain

Creates a cryptocurrency payment with a specific address for direct transactions.

### When to Use
- User **explicitly mentions** a cryptocurrency name
- Customer **must pay** with that exact cryptocurrency
- Need direct blockchain address and QR code

### Parameters

```json
{
  "amount_eur": 50.0,           // Required: Payment amount in EUR (>0)
  "input_currency": "BTC",      // Required: Crypto symbol (BTC, ETH, USDC, etc.)
  "fiat": "EUR",               // Optional: Fiat currency (default: EUR)
  "notes": "Order #12345",      // Optional: Payment description (max 256 chars)
  "include_qr": true            // Optional: Include QR codes (default: true)
}
```

#### Parameter Details

- **`amount_eur`** (required): Positive number, minimum 0.01
- **`input_currency`** (required): Cryptocurrency symbol. Get available options with `list_currencies_catalog`
- **`fiat`**: ISO 4217 currency code (EUR, USD, GBP, etc.)
- **`notes`**: Free text description for the payment
- **`include_qr`**: Set to `false` to generate QR codes later with `generate_payment_qr`

### Response

```json
{
  "identifier": "2e7d2c03-...",
  "address": "bc1q...",
  "payment_uri": "bitcoin:bc1q...?amount=0.001234",
  "expected_input_amount": 0.001234,
  "input_currency": "BTC",
  "expires_at": "2025-10-01T15:30:00.000Z",
  "qr_codes": {
    "address": "data:image/png;base64,iVBORw0KGgo...",
    "payment_uri": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

#### Response Fields

- **`identifier`**: Unique payment ID for status tracking
- **`address`**: Cryptocurrency address for direct payment
- **`payment_uri`**: URI with amount for wallet integration
- **`expected_input_amount`**: Exact crypto amount to send
- **`input_currency`**: Confirmed cryptocurrency symbol
- **`expires_at`**: ISO 8601 timestamp when payment expires (timer starts immediately)
- **`qr_codes`**: Base64-encoded QR code images (if `include_qr: true`)

#### ⏰ Important: Payment Expiration

When a cryptocurrency is selected for an onchain payment, the payment timer starts **immediately**. The `expires_at` field indicates the exact deadline. Always inform users about the time remaining to complete the payment to avoid expiration.

### Example Usage

```json
// Bitcoin payment for coffee
{
  "amount_eur": 4.50,
  "input_currency": "BTC",
  "notes": "Coffee shop purchase"
}

// Ethereum payment with custom fiat
{
  "amount_eur": 100.0,
  "input_currency": "ETH",
  "fiat": "USD",
  "notes": "USD-denominated payment"
}
```

---

## 🌐 create_payment_redirect

Creates a web-based payment URL where customers can choose their preferred cryptocurrency.

### When to Use (DEFAULT)
- No specific cryptocurrency mentioned
- Customer should choose payment method
- E-commerce checkout flows
- Maximum payment flexibility

### Parameters

```json
{
  "amount_eur": 50.0,                          // Required: Payment amount in EUR
  "url_ok": "https://store.com/success",       // Required: Success redirect URL
  "url_ko": "https://store.com/cancel",        // Required: Cancel redirect URL
  "fiat": "EUR",                               // Optional: Fiat currency
  "notes": "Order #12345",                     // Optional: Payment description
  "include_qr": false                          // Optional: Include gateway QR code
}
```

#### Parameter Details

- **`amount_eur`** (required): Positive number, minimum 0.01
- **`url_ok`** (required): Valid URL for successful payment redirect
- **`url_ko`** (required): Valid URL for cancelled payment redirect
- **`fiat`**: ISO 4217 currency code for amount denomination
- **`notes`**: Payment description or order reference
- **`include_qr`**: Generate QR code for the payment gateway URL

### Response

```json
{
  "identifier": "2e7d2c03-...",
  "web_url": "https://pay.bitnovo.com/abcd1234/",
  "gateway_qr": "data:image/png;base64,iVBORw0KGgo..."  // If include_qr: true
}
```

#### Response Fields

- **`identifier`**: Unique payment ID for status tracking
- **`web_url`**: Payment gateway URL for customer
- **`gateway_qr`**: QR code for the gateway URL (if requested)

### Example Usage

```json
// Generic payment with redirects
{
  "amount_eur": 25.0,
  "url_ok": "https://mystore.com/payment/success",
  "url_ko": "https://mystore.com/payment/cancel",
  "notes": "Product purchase"
}

// Payment with gateway QR code
{
  "amount_eur": 150.0,
  "url_ok": "https://booking.com/confirm",
  "url_ko": "https://booking.com/cancel",
  "include_qr": true,
  "notes": "Hotel reservation"
}
```

---

## 📊 get_payment_status

Retrieves current payment status and detailed information.

### When to Use
- Check payment progress
- Verify payment completion
- Monitor payment expiration
- Handle payment state changes

### Parameters

```json
{
  "identifier": "2e7d2c03-..."  // Required: Payment ID from create_payment_* response
}
```

### Response

```json
{
  "identifier": "2e7d2c03-...",
  "status": "AC",
  "status_description": "Awaiting Completion - Payment detected, waiting for confirmation",
  "confirmed_amount": 0.0,
  "unconfirmed_amount": 0.001234,
  "crypto_amount": 0.001234,
  "expired_time": "2025-09-26T12:34:56Z",
  "business_status": "payment_received_pending_confirmation"
}
```

#### Status Codes

| Code | Name | Description | User Action |
|------|------|-------------|-------------|
| `NR` | Not Ready | Payment created, crypto not assigned | Wait or choose crypto |
| `PE` | Pending | Waiting for customer payment | Show payment info |
| `AC` | Awaiting Completion | Payment detected, pending confirmation | Wait for confirmation |
| `IA` | Insufficient Amount | Amount too low | Send additional payment |
| `OC` | Out of Condition | Payment outside conditions | Contact support |
| `CO` | Completed | Payment confirmed | Transaction complete |
| `CA` | Cancelled | Payment cancelled | Allow recreation |
| `EX` | Expired | Payment window expired | Create new payment |
| `FA` | Failed | Payment failed | Create new payment |

#### Business Status (Enhanced)

- **`payment_received_pending_confirmation`**: Payment detected but not confirmed
- **`payment_partially_received`**: Partial payment received
- **`payment_complete`**: Payment fully confirmed
- **`payment_expired`**: Payment window closed
- **`payment_failed`**: Payment processing failed

### Example Usage

```json
// Check payment status
{
  "identifier": "abc-123-def-456"
}

// Response for pending confirmation
{
  "identifier": "abc-123-def-456",
  "status": "AC",
  "status_description": "Awaiting Completion",
  "confirmed_amount": 0.0,
  "unconfirmed_amount": 0.001500,
  "crypto_amount": 0.001500,
  "business_status": "payment_received_pending_confirmation"
}
```

---

## 💰 list_currencies_catalog

Retrieves available cryptocurrencies with optional amount-based filtering.

### When to Use
- Show payment options to customers
- Filter currencies by payment amount
- Discover supported cryptocurrencies
- Validate currency availability

### Parameters

```json
{
  "filter_by_amount": 25.0  // Optional: Filter currencies supporting this EUR amount
}
```

### Response

```json
[
  {
    "symbol": "BTC",
    "name": "Bitcoin",
    "min_amount": 0.01,
    "max_amount": null,
    "image": "https://cdn.bitnovo.com/images/BTC.png",
    "blockchain": "Bitcoin"
  },
  {
    "symbol": "ETH",
    "name": "Ethereum",
    "min_amount": 1.0,
    "max_amount": 10000.0,
    "image": "https://cdn.bitnovo.com/images/ETH.png",
    "blockchain": "Ethereum"
  }
]
```

#### Response Fields

- **`symbol`**: Cryptocurrency symbol for use in `input_currency`
- **`name`**: Human-readable currency name
- **`min_amount`**: Minimum payment amount in EUR
- **`max_amount`**: Maximum payment amount in EUR (null = no limit)
- **`image`**: Currency logo URL
- **`blockchain`**: Blockchain network name

#### Filtering Logic

When `filter_by_amount` is provided:
- Returns currencies where `min_amount <= filter_by_amount <= max_amount`
- If `max_amount` is null, no upper limit is applied

### Example Usage

```json
// Get all currencies
{}

// Get currencies for 50 EUR payment
{
  "filter_by_amount": 50.0
}

// Response (filtered)
[
  {
    "symbol": "BTC",
    "name": "Bitcoin",
    "min_amount": 0.01,
    "max_amount": null,
    "image": "https://cdn.bitnovo.com/images/BTC.png",
    "blockchain": "Bitcoin"
  }
]
```

---

## 🔳 generate_payment_qr

Generates custom QR codes for existing payments with advanced styling options.

### When to Use
- Create custom QR code styles
- Generate QR codes after payment creation
- Different QR code sizes or formats
- Branded vs basic QR codes

### Parameters

```json
{
  "identifier": "2e7d2c03-...",    // Required: Payment ID
  "qr_type": "both",               // Optional: QR type (default: both)
  "size": 300,                     // Optional: Size in pixels (default: 300)
  "style": "branded",              // Optional: Style type (default: branded)
  "branding": true,                // Optional: Include Bitnovo branding (default: true)
  "gateway_environment": "production"  // Optional: Environment for gateway URLs
}
```

#### Parameter Details

- **`identifier`** (required): Payment ID from create_payment response
- **`qr_type`**: Type of QR code to generate
  - `"address"`: Cryptocurrency address only
  - `"payment_uri"`: Payment URI with amount
  - `"both"`: Both address and payment URI QR codes
  - `"gateway_url"`: Payment gateway URL QR code
- **`size`**: QR code dimensions (100-1000 pixels)
- **`style`**: Visual style
  - `"basic"`: Plain black and white QR code
  - `"branded"`: QR code with cryptocurrency logo
- **`branding`**: Include Bitnovo Pay branding
- **`gateway_environment`**: For gateway URL generation (`development`, `testing`, `production`)

### Response

```json
{
  "identifier": "2e7d2c03-...",
  "qr_codes": {
    "address": "data:image/png;base64,iVBORw0KGgo...",
    "payment_uri": "data:image/png;base64,iVBORw0KGgo...",
    "gateway_url": "data:image/png;base64,iVBORw0KGgo..."
  },
  "metadata": {
    "size": 300,
    "style": "branded",
    "branding": true,
    "generated_at": "2025-01-15T10:30:00Z"
  }
}
```

### Example Usage

```json
// Generate large branded QR codes
{
  "identifier": "abc-123-def",
  "size": 500,
  "style": "branded",
  "qr_type": "both"
}

// Generate simple address QR code
{
  "identifier": "xyz-789-ghi",
  "qr_type": "address",
  "size": 200,
  "style": "basic",
  "branding": false
}

// Generate gateway QR code for web payments
{
  "identifier": "web-payment-456",
  "qr_type": "gateway_url",
  "size": 400
}
```

---

## 🔧 Common Patterns

### 1. Complete Payment Flow

```javascript
// 1. Show currency options
list_currencies_catalog({ filter_by_amount: 50.0 })

// 2. Create specific crypto payment
create_payment_onchain({
  amount_eur: 50.0,
  input_currency: "BTC",
  notes: "Coffee purchase"
})

// 3. Monitor payment status
get_payment_status({ identifier: "payment_id" })

// 4. Generate additional QR codes if needed
generate_payment_qr({
  identifier: "payment_id",
  size: 500,
  style: "branded"
})
```

### 2. Generic Payment Flow

```javascript
// 1. Create web payment with redirects
create_payment_redirect({
  amount_eur: 100.0,
  url_ok: "https://store.com/success",
  url_ko: "https://store.com/cancel",
  include_qr: true
})

// 2. Customer chooses crypto on web gateway

// 3. Monitor payment status
get_payment_status({ identifier: "payment_id" })
```

## 🚨 Important Notes

### Exchange Rates
- **Exchange rates are never exposed** in tool responses for privacy and accuracy
- Rates are only accurate for EUR fiat currency
- Non-EUR currencies may have conversion inaccuracies

### Security
- All API calls use HTTPS
- Webhook validation available with HMAC signatures
- Sensitive data automatically masked in logs

### Limitations
- **5-second timeout** for API calls
- **Maximum 2 retries** with exponential backoff
- **Stateless operation** - no local data persistence

---

**Next**: Check [Usage Examples](examples.md) for real-world scenarios and [Error Handling](error-handling.md) for troubleshooting.