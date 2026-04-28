---
name: hubspot-configure-distribution
description: "Configures OAuth scopes, redirect URLs, and distribution settings in app-hsmeta.json. Aggregates required scopes from app objects, associations, and webhook subscriptions. Use when the user wants to configure or update OAuth, scopes, distribution, or redirect URLs for their HubSpot app."
---

# Configure OAuth + Distribution

Use this skill to configure or update the `auth` and `distribution` sections of `src/app/app-hsmeta.json`. This is typically run after app objects and webhooks are defined, so all required scopes can be aggregated.

## Step 1: Read Current Project State

Read these files to understand what the app needs:

1. `src/app/app-hsmeta.json` — current auth/distribution config
2. `src/app/app-objects/` — all `*-object-hsmeta.json` files (determines custom object scopes)
3. `src/app/app-objects/app-object-associations/` — all association files (determines standard object scopes)
4. `src/app/webhooks/webhooks-hsmeta.json` — webhook subscriptions (may require additional scopes)

## Step 2: Aggregate Required Scopes

Build the scope list by scanning app objects, associations, and webhooks:

### App Objects Present?

If any `*-object-hsmeta.json` files exist in `src/app/app-objects/`:

- Add `crm.objects.custom.read`
- Add `crm.objects.custom.write`

These are always required when the app defines app objects.

### Associations with Standard Objects?

Scan association files in `src/app/app-objects/app-object-associations/`. For each standard object referenced:

| Associated Object | Add Scope |
|---|---|
| `CONTACT` | `crm.objects.contacts.read` |
| `COMPANY` | `crm.objects.companies.read` |
| `DEAL` | `crm.objects.deals.read` |
| `TICKET` | `crm.objects.tickets.read` |

Only add **read** scopes for associated standard objects — the app reads them to display associations, not to modify them. Add write scopes only if the user explicitly states the app needs to create or update those standard objects.

### Webhook Subscriptions?

If `webhooks-hsmeta.json` exists, check which object types have subscriptions. Webhook delivery itself does not require extra scopes, but if the app processes webhook events and then reads/writes the triggering object via API, the corresponding scopes must be present.

### Full Scope Reference

| Object | Read Scope | Write Scope |
|---|---|---|
| Contacts | `crm.objects.contacts.read` | `crm.objects.contacts.write` |
| Companies | `crm.objects.companies.read` | `crm.objects.companies.write` |
| Deals | `crm.objects.deals.read` | `crm.objects.deals.write` |
| Tickets | `crm.objects.tickets.read` | `crm.objects.tickets.write` |
| Custom/App Objects | `crm.objects.custom.read` | `crm.objects.custom.write` |

## Step 3: Classify Scopes

HubSpot supports three scope categories:

- **`requiredScopes`** — the app cannot function without these. Customer must approve all of them during install. This is where most scopes go.
- **`optionalScopes`** — the app works without them but offers additional features if granted. Use sparingly — marketplace review checks that optional scopes are actually used conditionally.
- **`conditionallyRequiredScopes`** — required only when certain features are enabled. Rarely used for app-object-based apps.

**Default:** Put all aggregated scopes in `requiredScopes`. Only move scopes to `optionalScopes` if the user explicitly says a feature is optional.

## Step 4: Configure Redirect URLs

The `redirectUrls` array in `auth` specifies where HubSpot sends the OAuth authorization code after the customer approves the install.

**Rules:**
- Must be HTTPS
- Must match exactly what the customer's backend expects (including path)
- Use `https://YOUR_BACKEND/api/hubspot/oauth/callback` as the placeholder
- The customer replaces this with their real URL before going live

If the user provides a specific redirect URL, use it. Otherwise keep the placeholder and note it in your response.

## Step 5: Set Distribution

Always set `"distribution": "marketplace"`. This is the only distribution type that:
- Allows up to 25 installs pre-listing (no allowlist needed)
- Is eligible for marketplace listing
- Supports unlimited installs post-listing

Do NOT use `"private"` unless the user explicitly requests it.

## Step 6: Write the Config

Update the `auth` and `distribution` fields in `src/app/app-hsmeta.json`:

```json
{
  "uid": "<existing_uid>",
  "type": "app",
  "config": {
    "name": "<existing_name>",
    "description": "<existing_description>",
    "logo": "/app/app-logo.png",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["https://YOUR_BACKEND/api/hubspot/oauth/callback"],
      "requiredScopes": [
        "crm.objects.custom.read",
        "crm.objects.custom.write",
        "crm.objects.contacts.read"
      ],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    }
  }
}
```

Preserve all existing fields (`uid`, `name`, `description`, `logo`). Only update `distribution` and `auth`.

## Step 7: Warn About Scope Changes After Install

If this is an update to an already-uploaded app (not the first configuration), warn the user:

> "Adding new **required** scopes to an already-installed app will require existing customers to **re-authorize**. They'll see a prompt to approve the new scopes. Consider using `optionalScopes` for non-critical additions to avoid disrupting existing installs."

## Step 8: Validate

After writing, verify:

1. `requiredScopes` is not empty (every marketplace app needs at least one scope)
2. `crm.objects.custom.read` and `crm.objects.custom.write` are present if app objects exist
3. Read scopes are present for every standard object the app associates with
4. `distribution` is `"marketplace"`
5. `redirectUrls` has at least one entry
6. No duplicate scopes across `requiredScopes`, `optionalScopes`, and `conditionallyRequiredScopes`

## Step 9: Report to User

Tell the user:
- Which scopes were added and why
- Whether redirect URL is a placeholder or their real URL
- Distribution type is set to marketplace
- If any scopes were moved to optional (and why)
- Reminder: only request scopes the app actually uses — marketplace review checks this
