---
name: hubspot-install-test-account
description: "Creates a HubSpot Developer Test Account via CLI, registers it for dashboard tracking, then guides the user through installing their app via OAuth. Use after a successful upload when the user wants to test their app."
---

# Install HubSpot App in Test Account

Use this skill after a successful `hs project upload` when the user wants to test their app.

## Step 1: Verify Prerequisites

1. **Successful upload** — confirm the last `hs project upload` succeeded (a build record should exist)
2. **HubSpot CLI authenticated** — `hs accounts list` should show the connected developer account

If either prerequisite fails, stop and explain what needs to happen first.

## Step 2: Create Test Account

Run the HubSpot CLI to create a Developer Test Account:

```bash
hs test-account create
```

Parse the CLI output to extract:
- **Portal ID** (account ID) — the numeric ID of the new test account
- **Account name** — the name assigned to the test account

If the CLI fails (e.g., already at 10-account limit), explain the error and suggest the user delete an unused test account from Settings > Testing > Developer Test Accounts.

## Step 3: Register Test Account

Call `register_hubspot_test_account` with:
- `portalId` — from CLI output
- `portalName` — from CLI output (or "Developer Test Account" if not parsed)
- `expiresAt` — calculate as 90 days from now in ISO format

This persists the test account for dashboard tracking.

## Step 4: Get App Details

Read `src/app/app-hsmeta.json` to extract:
- `requiredScopes` — from the auth config
- `redirectUrls` — the OAuth callback URL

The user will need their app's `client_id` from the HubSpot developer dashboard.

## Step 5: Generate OAuth Authorization URL

Construct the install URL:

```
https://app.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&scope={SCOPES}&redirect_uri={REDIRECT_URI}
```

Where:
- `{CLIENT_ID}` — ask the user for their app's client_id from the HubSpot developer dashboard
- `{SCOPES}` — space-separated list from `app-hsmeta.json` requiredScopes (URL-encoded)
- `{REDIRECT_URI}` — from `app-hsmeta.json` redirectUrls[0] (URL-encoded)

## Step 6: Guide User Through Install

Present the URL and walk the user through the process:

> "Your test account (portal {PORTAL_ID}) has been created. To install the app:
>
> 1. Open this URL in your browser (logged into the new test account):
>    `<constructed URL>`
>
> 2. Review the requested permissions and click **Authorize**
>
> 3. You'll be redirected to your OAuth callback URL with an authorization code
>    - If your backend isn't set up yet, you'll get a redirect error — that's OK, the app is still installed
>
> 4. The app should now appear in the test account under **Settings > Integrations > Connected Apps**"

Additional notes for the user:
- **Unverified app warning** — test accounts may show "I accept the risk" banner for unverified apps. This is normal for development.
- **Token exchange** — the customer's backend exchanges the auth code for tokens (per INTEGRATION.md)

## Step 7: Verify Installation

After the user confirms they've authorized the app:

1. **Check Connected Apps** — app should appear in test account's Connected Apps
2. **Check App Objects** — if the app has app objects, verify they were created:
   - In HubSpot: Settings > Objects > Custom Objects — app objects should appear
   - Or via API: `GET /crm/v3/schemas` to list all object schemas
3. **Check Webhook Subscriptions** — in the developer dashboard, app's Webhooks tab should show configured subscriptions

## Step 8: Report

Summarize what was created:
- Test account portal ID and name
- App installed via OAuth
- What was created (app objects, webhook subscriptions if applicable)
- How to access the app in the test account

Remind the user:
- **90-day expiry** — the test account expires in 90 days. Create a new one before expiry if needed.
- **Enterprise features** — test accounts include Enterprise-tier features for testing
- **No production data** — never use a test account for production workloads
- **Auto-updates** — if you upload changes to the project, they apply to all installs automatically. No need to re-install.

Next steps: implement backend per INTEGRATION.md, test OAuth flow, test webhook delivery
