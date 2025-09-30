# API Usage Examples

Real-world examples demonstrating how to use the MCP Bitnovo Pay tools effectively.

## 📋 Overview

This document provides practical examples for common payment scenarios across different LLM platforms.

## 🏪 E-commerce Scenarios

### 1. Coffee Shop - Bitcoin Payment

**Customer Request**: *"I want to pay for my coffee with Bitcoin. The coffee costs 4.50 euros."*

**Tool Selection**: `create_payment_onchain` (specific crypto mentioned)

**Request**:
```json
{
  "tool": "create_payment_onchain",
  "arguments": {
    "amount_eur": 4.50,
    "input_currency": "BTC",
    "notes": "Coffee shop purchase",
    "include_qr": true
  }
}
```

**Response**:
```json
{
  "identifier": "coffee-2025-01-15-001",
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "payment_uri": "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.00011250",
  "expected_input_amount": 0.00011250,
  "input_currency": "BTC",
  "qr_codes": {
    "address": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "payment_uri": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**AI Response**: *"I've created a Bitcoin payment for your 4.50€ coffee. Please send exactly 0.00011250 BTC to this address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. You can scan the QR code with your Bitcoin wallet for easy payment."*

### 2. Online Store - Customer Choice Payment

**Customer Request**: *"Create a payment for my 75 euro order, redirect to my store pages when done."*

**Tool Selection**: `create_payment_redirect` (no specific crypto, customer choice)

**Request**:
```json
{
  "tool": "create_payment_redirect",
  "arguments": {
    "amount_eur": 75.0,
    "url_ok": "https://mystore.com/order/success?id=12345",
    "url_ko": "https://mystore.com/order/cancel?id=12345",
    "notes": "Order #12345 - Electronics",
    "include_qr": true
  }
}
```

**Response**:
```json
{
  "identifier": "order-12345-2025-01-15",
  "web_url": "https://pay.bitnovo.com/p/abc123def456",
  "gateway_qr": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**AI Response**: *"I've created a payment link for your 75€ order. Your customer can choose any supported cryptocurrency at: https://pay.bitnovo.com/p/abc123def456. They'll be redirected to your success page after payment, or to your cancel page if they abandon the payment."*

### 3. Service Business - USD Denominated Payment

**Customer Request**: *"I need to charge a US client 200 USD, they want to pay with Ethereum."*

**Tool Selection**: `create_payment_onchain` (ETH mentioned)

**Request**:
```json
{
  "tool": "create_payment_onchain",
  "arguments": {
    "amount_eur": 200.0,
    "input_currency": "ETH",
    "fiat": "USD",
    "notes": "Consulting services - USD client",
    "include_qr": true
  }
}
```

**Response**:
```json
{
  "identifier": "service-usd-2025-01-15-003",
  "address": "0x742d35Cc6637C0532c2e4Bc6C71B4F7a7e3c4F8D",
  "payment_uri": "ethereum:0x742d35Cc6637C0532c2e4Bc6C71B4F7a7e3c4F8D?value=85000000000000000",
  "expected_input_amount": 0.085,
  "input_currency": "ETH",
  "qr_codes": {
    "address": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "payment_uri": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

## 🔍 Payment Monitoring

### 4. Payment Status Tracking

**Scenario**: Checking the status of a payment that was created earlier.

**Customer Request**: *"What's the status of payment coffee-2025-01-15-001?"*

**Request**:
```json
{
  "tool": "get_payment_status",
  "arguments": {
    "identifier": "coffee-2025-01-15-001"
  }
}
```

**Response Variations**:

#### Payment Pending
```json
{
  "identifier": "coffee-2025-01-15-001",
  "status": "PE",
  "status_description": "Pending - Waiting for customer payment",
  "confirmed_amount": 0.0,
  "unconfirmed_amount": 0.0,
  "crypto_amount": 0.0,
  "expired_time": "2025-01-15T11:30:00Z",
  "business_status": "awaiting_payment"
}
```

**AI Response**: *"Payment is still pending. The customer hasn't sent the Bitcoin payment yet. The payment will expire at 11:30 AM if not completed."*

#### Payment Received (Awaiting Confirmation)
```json
{
  "identifier": "coffee-2025-01-15-001",
  "status": "AC",
  "status_description": "Awaiting Completion - Payment detected, waiting for confirmation",
  "confirmed_amount": 0.0,
  "unconfirmed_amount": 0.00011250,
  "crypto_amount": 0.00011250,
  "expired_time": "2025-01-15T11:30:00Z",
  "business_status": "payment_received_pending_confirmation"
}
```

**AI Response**: *"Great news! The Bitcoin payment has been received and is waiting for blockchain confirmation. The customer sent exactly 0.00011250 BTC. The payment should be fully confirmed within 10-30 minutes."*

#### Payment Complete
```json
{
  "identifier": "coffee-2025-01-15-001",
  "status": "CO",
  "status_description": "Completed - Payment confirmed",
  "confirmed_amount": 0.00011250,
  "unconfirmed_amount": 0.0,
  "crypto_amount": 0.00011250,
  "business_status": "payment_complete"
}
```

**AI Response**: *"Payment completed successfully! The Bitcoin payment has been fully confirmed on the blockchain. You can now deliver the coffee to the customer."*

## 💱 Currency Discovery

### 5. Exploring Payment Options

**Customer Request**: *"What cryptocurrencies can I accept for payments under 50 euros?"*

**Request**:
```json
{
  "tool": "list_currencies_catalog",
  "arguments": {
    "filter_by_amount": 50.0
  }
}
```

**Response**:
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
  },
  {
    "symbol": "USDC_ETH",
    "name": "USD Coin (Ethereum)",
    "min_amount": 1.0,
    "max_amount": 5000.0,
    "image": "https://cdn.bitnovo.com/images/USDC.png",
    "blockchain": "Ethereum"
  },
]
```

**AI Response**: *"For payments under 50 euros, you can accept these cryptocurrencies: Bitcoin (BTC) - minimum 0.01€, no maximum; Ethereum (ETH) - 1€ to 10,000€; USD Coin (USDC) - 1€ to 5,000€. All are supported for your payment range."*

### 6. High-Value Payment Options

**Customer Request**: *"I need to receive a 5000 euro payment. What are my cryptocurrency options?"*

**Request**:
```json
{
  "tool": "list_currencies_catalog",
  "arguments": {
    "filter_by_amount": 5000.0
  }
}
```

**Response**:
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

**AI Response**: *"For a 5000€ payment, you have two options: Bitcoin (BTC) with no upper limit, and Ethereum (ETH) with support up to 10,000€. Both can handle your payment amount. The stablecoin USDC has lower limits and won't work for this amount."*

## 🔳 QR Code Customization

### 7. Custom QR Code Generation

**Customer Request**: *"Generate a large branded QR code for payment order-12345-2025-01-15."*

**Request**:
```json
{
  "tool": "generate_payment_qr",
  "arguments": {
    "identifier": "order-12345-2025-01-15",
    "qr_type": "both",
    "size": 500,
    "style": "branded",
    "branding": true
  }
}
```

**Response**:
```json
{
  "identifier": "order-12345-2025-01-15",
  "qr_codes": {
    "address": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "payment_uri": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  },
  "metadata": {
    "size": 500,
    "style": "branded",
    "branding": true,
    "generated_at": "2025-01-15T10:30:00Z"
  }
}
```

**AI Response**: *"I've generated large 500x500 pixel branded QR codes for your payment. The QR codes include the cryptocurrency logo and Bitnovo branding. You have both an address QR code and a payment URI QR code for customer convenience."*

### 8. Simple QR Code for POS

**Customer Request**: *"Create a simple black and white QR code for our point-of-sale system, 200 pixels, no branding."*

**Request**:
```json
{
  "tool": "generate_payment_qr",
  "arguments": {
    "identifier": "pos-payment-456",
    "qr_type": "payment_uri",
    "size": 200,
    "style": "basic",
    "branding": false
  }
}
```

**Response**:
```json
{
  "identifier": "pos-payment-456",
  "qr_codes": {
    "payment_uri": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  },
  "metadata": {
    "size": 200,
    "style": "basic",
    "branding": false,
    "generated_at": "2025-01-15T10:35:00Z"
  }
}
```

## 🔄 Complete Payment Workflows

### 9. Restaurant Order Flow

**Scenario**: Complete restaurant payment workflow

**Step 1: Customer explores options**
```
Customer: "What cryptocurrencies can I use to pay for my 28 euro dinner?"
```

```json
{
  "tool": "list_currencies_catalog",
  "arguments": {
    "filter_by_amount": 28.0
  }
}
```

**Step 2: Customer chooses Bitcoin**
```
Customer: "I'll pay with Bitcoin"
```

```json
{
  "tool": "create_payment_onchain",
  "arguments": {
    "amount_eur": 28.0,
    "input_currency": "BTC",
    "notes": "Restaurant dinner payment",
    "include_qr": true
  }
}
```

**Step 3: Monitor payment**
```json
{
  "tool": "get_payment_status",
  "arguments": {
    "identifier": "restaurant-payment-789"
  }
}
```

**Step 4: Payment confirmed**
```
Final status: "CO" (Completed)
AI: "Payment successful! The customer's Bitcoin payment has been confirmed. You can now finalize their dinner order."
```

### 10. E-commerce Checkout Flow

**Scenario**: Online store with flexible payment options

**Step 1: Create flexible payment**
```
Store Owner: "Customer wants to buy items worth 150 euros, let them choose the cryptocurrency"
```

```json
{
  "tool": "create_payment_redirect",
  "arguments": {
    "amount_eur": 150.0,
    "url_ok": "https://store.com/order/success?id=67890",
    "url_ko": "https://store.com/order/cancel?id=67890",
    "notes": "E-commerce purchase - Order #67890",
    "include_qr": true
  }
}
```

**Step 2: Customer completes payment on gateway**
```
AI: "I've created a payment gateway where your customer can choose their preferred cryptocurrency. They'll be redirected back to your store after payment."
```

**Step 3: Webhook or status checking**
```json
{
  "tool": "get_payment_status",
  "arguments": {
    "identifier": "ecommerce-67890-2025"
  }
}
```

## 🚨 Error Handling Examples

### 11. Invalid Currency

**Request**:
```json
{
  "tool": "create_payment_onchain",
  "arguments": {
    "amount_eur": 50.0,
    "input_currency": "INVALID_COIN",
    "notes": "Test payment"
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "INVALID_CURRENCY",
    "message": "Cryptocurrency 'INVALID_COIN' is not supported",
    "details": "Use list_currencies_catalog to see available options"
  }
}
```

### 12. Amount Out of Range

**Request**:
```json
{
  "tool": "create_payment_onchain",
  "arguments": {
    "amount_eur": 0.005,
    "input_currency": "BTC",
    "notes": "Micro payment"
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "AMOUNT_TOO_LOW",
    "message": "Payment amount 0.005 EUR is below minimum for BTC",
    "details": {
      "min_amount": 0.01,
      "max_amount": null,
      "currency": "BTC"
    }
  }
}
```

## 💡 Best Practices

### Tool Selection
1. **Always use `create_payment_redirect`** for generic payments
2. **Only use `create_payment_onchain`** when customer specifies exact cryptocurrency
3. **Check currency availability** with `list_currencies_catalog` first
4. **Monitor payment status** regularly for time-sensitive scenarios

### QR Code Usage
- Use `include_qr: true` for immediate display
- Generate custom QR codes later for specific styling needs
- Consider QR code size based on display medium (web: 300px, print: 500px+)

### Error Recovery
- Always provide alternative options when currencies aren't available
- Guide users to check `list_currencies_catalog` for valid options
- Implement retry logic for network-related errors

---

**Next**: Check [Error Handling](error-handling.md) for comprehensive error management strategies.