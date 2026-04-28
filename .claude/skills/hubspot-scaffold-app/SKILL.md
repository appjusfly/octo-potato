---
name: hubspot-scaffold-app
description: "Scaffolds a new HubSpot app project from scratch: creates hsproject.json, app-hsmeta.json with OAuth config, directory structure for app objects and webhooks, and an initial INTEGRATION.md skeleton. Use when the user wants to create a new HubSpot app or start a fresh HubSpot project."
---

# Scaffold a New HubSpot App

Use this skill when the user wants to create a new HubSpot app from scratch.

## Step 1: Gather Requirements

Before scaffolding, confirm with the user:
1. **App name** — what should the app be called? (used in `hsproject.json` and `app-hsmeta.json`)
2. **What does the app do?** — brief description for `app-hsmeta.json`
3. **What data does it store?** — determines app objects needed (can be added later via `hubspot-create-app-object` skill)
4. **What standard objects does it interact with?** — contacts, companies, deals, tickets? (determines OAuth scopes)

## Step 2: Create `hsproject.json`

```json
{
  "name": "<app-name-kebab-case>",
  "srcDir": "src",
  "platformVersion": "2026.03"
}
```

Always use `platformVersion: "2026.03"` — this is the current stable version (requires CLI ≥ 8.3.0).

## Step 3: Create Directory Structure

```
src/app/
  app-hsmeta.json
  app-logo.png          # Placeholder — user will replace with real logo
  app-objects/           # Empty — populated by hubspot-create-app-object skill
  app-functions/         # Empty — for App Functions (serverless, one hsmeta per function)
  webhooks/              # Empty — populated by hubspot-configure-webhooks skill
```

## Step 4: Create `src/app/app-hsmeta.json`

```json
{
  "uid": "<app_name_snake_case>",
  "type": "app",
  "config": {
    "name": "<App Display Name>",
    "description": "<What this app does>",
    "logo": "/app/app-logo.png",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["https://YOUR_BACKEND/api/hubspot/oauth/callback"],
      "requiredScopes": [
        "oauth",
        "crm.objects.contacts.read"
      ],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    },
    "permittedUrls": {
      "fetch": ["https://api.hubapi.com"],
      "iframe": [],
      "img": []
    }
  }
}
```

**Important format notes (v2026.03):**
- `type` must be `"app"` — required top-level field
- All config (name, auth, distribution, permittedUrls) nests under `config`
- Scopes nest inside `auth`, NOT at the top level
- `permittedUrls` controls which external URLs the app's UI extensions can access

**Scope rules:**
- If the app will have app objects, add `crm.objects.custom.read` and `crm.objects.custom.write`
- Add read scopes for any standard objects the app associates with
- `redirectUrls` is a placeholder — the customer provides their real URL

## Step 5: Create Placeholder `app-logo.png`

Create a minimal placeholder PNG. Note to user that they should replace this with their actual app logo (512x512px recommended).

## Step 6: Notify About `contact.privacyDeletion`

Inform the user: "Every marketplace app must handle `contact.privacyDeletion` webhooks for GDPR compliance. When you're ready to configure webhooks, I'll include this automatically."

## Step 7: Generate Initial `INTEGRATION.md` Skeleton

Create `INTEGRATION.md` at the project root with placeholder sections:

```markdown
# Integration Guide — <App Name>

## Overview
<Brief description of what the app does and what the customer needs to implement.>

## OAuth Setup
- **Redirect URL:** Your backend must expose an HTTPS endpoint to receive the OAuth callback.
- **Token Exchange:** Exchange the authorization code for access + refresh tokens.
- **Token Storage:** Store tokens keyed by `hub_id` from the token response.
- **Token Refresh:** Access tokens expire in 30 minutes. Refresh before expiry.

## Webhook Receiver
_To be configured — see hubspot-configure-webhooks skill._

## App Objects
_To be configured — see hubspot-create-app-object skill._

## Platform Constraints
- App object properties are **append-only** — once uploaded, they cannot be removed.
- App object names are **permanent** — they cannot be renamed after first upload.
- `hs project upload` updates **all installs immediately** — no versioning or staged rollout.
- Uninstalling the app deletes app objects and their data from the customer's portal.
- HubSpot has **no built-in scheduler** — use an external scheduler (e.g., AWS EventBridge) for periodic tasks.
```

## Step 8: Commit

```bash
git add .
git commit -m "Scaffold HubSpot app: <app-name>"
```

## Step 9: Report to User

Tell the user:
- Project structure created
- What files were generated and what they do
- Next steps: define app objects, configure webhooks, upload to HubSpot
- Reminder: object names require HubSpot approval before first upload (~2-4 weeks)
