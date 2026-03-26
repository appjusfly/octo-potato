# Deeone HubSpot App — Integration Guide

## Overview

The **deeone** HubSpot app integrates your backend with HubSpot to:
- Track **onboarding milestones** as a custom CRM object
- Receive real-time **webhook notifications** when contacts are created or deals are updated

This guide covers everything needed to configure, deploy, and operate the integration.

---

## Project Structure

```
src/
└── app/
    ├── app-hsmeta.json
    ├── app-logo.png
    ├── app-objects/
    │   └── onboarding-milestone/
    │       └── onboarding-milestone.json
    └── webhooks/
        └── webhooks.json
hsproject.json
```

---

## Prerequisites

- HubSpot CLI installed (`npm install -g @hubspot/cli`)
- A HubSpot developer account with a test portal
- A backend server with a publicly accessible HTTPS endpoint
- Node.js 18+

---

## 1. Environment Setup

### 1.1 Authenticate the CLI

```bash
hs auth
```

### 1.2 Configure Your Backend URL

Replace all instances of `YOUR_BACKEND` in:
- `src/app/app-hsmeta.json` → `auth.redirectUrls`
- `src/app/webhooks/webhooks.json` → `targetUrl`

---

## 2. OAuth Configuration

Required scopes:
- `crm.objects.contacts.read`
- `crm.objects.deals.read`

---

## 3. Custom App Object — Onboarding Milestone

| Property | Label | Type |
|---|---|---|
| `milestone_name` | Milestone Name | string (required) |
| `milestone_status` | Status | enumeration (Not Started / In Progress / Completed / Blocked) |
| `milestone_due_date` | Due Date | date |

---

## 4. Webhooks

| Event | Trigger |
|---|---|
| `contact.creation` | New contact created |
| `deal.propertyChange` | Deal property updated |

Always validate `X-HubSpot-Signature` and respond within 5 seconds.

---

## 5. Deploying

```bash
hs project upload
hs project deploy-status
```

---

## Reference Links

- [HubSpot Projects CLI Docs](https://developers.hubspot.com/docs/platform/project-cli-commands)
- [CRM Custom Objects API](https://developers.hubspot.com/docs/api/crm/crm-custom-objects)
- [Webhooks API Reference](https://developers.hubspot.com/docs/api/webhooks)
- [OAuth 2.0 Guide](https://developers.hubspot.com/docs/api/oauth-quickstart-guide)
