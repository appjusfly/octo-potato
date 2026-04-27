# Integration Contract — testone HubSpot App

This document defines the backend contracts your server must implement to integrate with HubSpot.

---

## OAuth

### Redirect URL
```
https://wearifully-subtentacular-jedidiah.ngrok-free.dev/oauth/callback
```

### Token Exchange
When HubSpot redirects to your callback with a `code` parameter, exchange it for tokens:

```javascript
const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.HUBSPOT_CLIENT_ID,
    client_secret: process.env.HUBSPOT_CLIENT_SECRET,
    redirect_uri: 'https://wearifully-subtentacular-jedidiah.ngrok-free.dev/oauth/callback',
    code: req.query.code,
  }),
});
const { access_token, refresh_token, expires_in } = await response.json();
```

Store `access_token`, `refresh_token`, and expiry. Refresh tokens are long-lived; access tokens expire after 30 minutes.

---

## Webhook Receiver

### Endpoint
Your backend must expose: `POST /webhook` (HTTPS required)

### Signature Verification (REQUIRED)
Verify every request using `X-HubSpot-Signature-v3` and `X-HubSpot-Request-Timestamp`:

```javascript
const crypto = require('crypto');

function verifyWebhook(clientSecret, method, uri, rawBody, timestamp, signature) {
  // Reject requests older than 5 minutes
  if (Date.now() - Number(timestamp) > 5 * 60 * 1000) return false;

  const sourceString = method + uri + rawBody + timestamp;
  const hash = crypto
    .createHmac('sha256', clientSecret)
    .update(sourceString)
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hubspot-signature-v3'];
  const timestamp = req.headers['x-hubspot-request-timestamp'];
  const rawBody = req.rawBody; // Must capture raw body before parsing

  if (!verifyWebhook(process.env.HUBSPOT_CLIENT_SECRET, 'POST', req.originalUrl, rawBody, timestamp, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Return 2xx immediately — process events async
  res.status(200).send('OK');

  const events = JSON.parse(rawBody);
  processEventsAsync(events);
});
```

### Constraints
- **5-second timeout** — return 2xx immediately, process events asynchronously
- **Batched delivery** — up to 100 events per POST request
- **Event ordering NOT guaranteed** — use `occurredAt` timestamp for ordering
- **Duplicates possible** — implement idempotency using `eventId`
- **Retries** — HubSpot retries 10 times over 24 hours on failure

### Event Payload Format
```json
[
  {
    "objectId": 1246965,
    "changeSource": "API",
    "eventId": 3816279340,
    "subscriptionId": 25,
    "portalId": 33,
    "appId": 1160452,
    "occurredAt": 1462216307945,
    "subscriptionType": "contact.creation",
    "attemptNumber": 0
  }
]
```

### Subscriptions Configured

| Event | Action Required |
|---|---|
| `contact.creation` | A new contact (Connect account) was created. Provision the account in your system, trigger onboarding flow, etc. |
| `contact.privacyDeletion` | GDPR deletion request — **must delete all data** associated with `objectId` from your systems |

### GDPR: contact.privacyDeletion (MANDATORY)
When a `contact.privacyDeletion` event is received, your backend MUST:
1. Look up the contact by `objectId`
2. Delete ALL data associated with that contact from your systems
3. Return 2xx to confirm processing

Failure to handle this event is a HubSpot marketplace compliance violation.
