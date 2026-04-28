---
name: hubspot-configure-webhooks
description: "Generates HubSpot webhook subscription configuration: creates webhooks-hsmeta.json with targetUrl and throttling, documents available event types, always includes contact.privacyDeletion for GDPR, and updates INTEGRATION.md with webhook receiver contracts. Use when the user wants event-driven behavior or webhook notifications."
---

# Configure HubSpot Webhooks

Use this skill when the user wants their app to react to events in HubSpot (record creation, updates, deletions, etc.).

## Step 1: Understand What Events the User Needs

Ask the user what should trigger actions. Map their needs to HubSpot event types:

**Available event types (standard objects — production):**

| Event | Objects | Description |
|---|---|---|
| `{object}.creation` | Contact, Company, Deal, Ticket | Record created |
| `{object}.deletion` | Contact, Company, Deal, Ticket | Record deleted |
| `{object}.propertyChange` | Contact, Company, Deal, Ticket | Specific property changed |
| `{object}.merge` | Contact, Company, Deal | Records merged |
| `{object}.associationChange` | Contact, Company, Deal, Ticket | Association added/removed |
| `{object}.restore` | Contact, Company, Deal, Ticket | Record restored from recycle bin |
| `contact.privacyDeletion` | Contact only | GDPR deletion request (**MANDATORY**) |

**Custom/App object events (beta toggle — "Expand object support"):**
Same event types available. Exception: `associationChange` for custom objects does NOT work yet.

**Property-level subscriptions:**
You can subscribe to changes on a specific property:
```json
{
  "eventType": "contact.propertyChange",
  "propertyName": "lifecyclestage"
}
```

## Step 2: Generate `webhooks-hsmeta.json`

Create `src/app/webhooks/webhooks-hsmeta.json`:

```json
{
  "uid": "app_webhooks",
  "type": "webhooks",
  "config": {
    "settings": {
      "targetUrl": "https://YOUR_BACKEND/api/hubspot/webhooks",
      "maxConcurrentRequests": 10
    },
    "subscriptions": {
      "crmObjects": [],
      "legacyCrmObjects": [],
      "hubEvents": [
        {
          "subscriptionType": "contact.privacyDeletion",
          "active": true
        }
      ]
    }
  }
}
```

**Important format notes (v2026.03):**
- `targetUrl` and `maxConcurrentRequests` nest under `config.settings` (NOT directly under `config`)
- Subscriptions nest under `config.subscriptions` with three arrays:
  - `crmObjects` — modern generic format: `{ "subscriptionType": "object.creation", "objectType": "contact", "active": true }`
  - `legacyCrmObjects` — legacy format: `{ "subscriptionType": "contact.propertyChange", "propertyName": "lastname", "active": true }`
  - `hubEvents` — HubSpot events: `{ "subscriptionType": "contact.privacyDeletion", "active": true }`
- `targetUrl` is a placeholder — the customer provides their actual URL before upload

## Step 3: Always Include `contact.privacyDeletion`

**MANDATORY for all marketplace apps.** The example above already includes it in `hubEvents`. Inform the user:

> "I've included `contact.privacyDeletion` in the webhook subscriptions. This is required by HubSpot for all marketplace apps — when a contact requests data deletion under GDPR, your backend must delete all associated data for that contact."

Add additional subscriptions based on user requirements into the appropriate array (`crmObjects` for modern format, `legacyCrmObjects` for property-change subscriptions).

## Step 4: Update OAuth Scopes

Webhooks require read scopes for the objects being watched. Update `app-hsmeta.json` scopes:

- `contact.*` events → `crm.objects.contacts.read`
- `company.*` events → `crm.objects.companies.read`
- `deal.*` events → `crm.objects.deals.read`
- `ticket.*` events → `crm.objects.tickets.read`
- Custom/app object events → `crm.objects.custom.read`

## Step 5: Update `INTEGRATION.md` — Webhook Receiver Contract

Add or update the "Webhook Receiver" section:

```markdown
## Webhook Receiver

### Endpoint
Your backend must expose: `POST /api/hubspot/webhooks` (HTTPS required)

### Signature Verification (REQUIRED)
Verify every request using `X-HubSpot-Signature-v3` and `X-HubSpot-Request-Timestamp`:

\`\`\`javascript
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

// In your route handler:
app.post('/api/hubspot/webhooks', (req, res) => {
  const signature = req.headers['x-hubspot-signature-v3'];
  const timestamp = req.headers['x-hubspot-request-timestamp'];
  const rawBody = req.rawBody; // Must capture raw body before parsing

  if (!verifyWebhook(process.env.HUBSPOT_CLIENT_SECRET, 'POST', req.originalUrl, rawBody, timestamp, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Return 2xx immediately — process events async
  res.status(200).send('OK');

  // Process events asynchronously
  const events = JSON.parse(rawBody);
  processEventsAsync(events);
});
\`\`\`

### Constraints
- **5-second timeout** — return 2xx immediately, process events asynchronously
- **Batched delivery** — up to 100 events per POST request
- **Event ordering NOT guaranteed** — use `occurredAt` timestamp for ordering
- **Duplicates possible** — implement idempotency using `eventId`
- **Retries** — HubSpot retries 10 times over 24 hours on failure

### Event Payload Format
\`\`\`json
[
  {
    "objectId": 1246965,
    "propertyName": "lifecyclestage",
    "propertyValue": "subscriber",
    "changeSource": "API",
    "eventId": 3816279340,
    "subscriptionId": 25,
    "portalId": 33,
    "appId": 1160452,
    "occurredAt": 1462216307945,
    "eventType": "contact.propertyChange",
    "attemptNumber": 0
  }
]
\`\`\`

### Subscriptions Configured
<List the event subscriptions the app uses and what the backend should do for each>

### GDPR: contact.privacyDeletion (MANDATORY)
When a `contact.privacyDeletion` event is received, your backend MUST:
1. Look up the contact by `objectId`
2. Delete ALL data associated with that contact from your systems
3. Return 2xx to confirm processing
```

## Step 6: Commit

```bash
git add .
git commit -m "Configure webhooks for <event list>"
```

## Step 7: Report to User

Tell the user:
- What webhook configuration was created
- That `contact.privacyDeletion` is included (GDPR requirement)
- That `targetUrl` is a placeholder — they need to provide their real URL before upload
- That webhook subscriptions are activated after upload via the HubSpot API
- Their backend must implement signature verification and the 5-second timeout contract
