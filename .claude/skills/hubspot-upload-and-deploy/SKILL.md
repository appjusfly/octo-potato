---
name: hubspot-upload-and-deploy
description: "Uploads a HubSpot project to HubSpot via a strict sequential pipeline: branch verification, project linting, object name approval check, upload, build monitoring, error recovery, commit, push, and PR creation. Use when the user explicitly asks to deploy, upload, build, or push their HubSpot app."
---

# HubSpot Upload & Deploy Pipeline

CRITICAL: This is a strict sequential pipeline. Execute every step in order. Do NOT skip any step. If a step fails, fix and retry — do not move on without completing it.

## Prerequisites

Verify ALL of these before starting. If any fail, stop and tell the user:
1. `hsproject.json` exists at the workspace root
2. `src/app/app-hsmeta.json` exists with valid OAuth config
3. HubSpot CLI is authenticated: `hs accounts list` should show the connected account (PAK is in `$HUBSPOT_PERSONAL_ACCESS_KEY` env var — do NOT ask the user for credentials)
4. You are on the correct agent branch (check `agent_branch` from `<session_context>`)

## Step 1: Verify Working Branch

```bash
git branch --show-current
```

Must match `agent_branch` from `<session_context>`. If not, run `git checkout <agent_branch>`.

## Step 2: Lint the Project

```bash
hs project lint
```

If linting reports errors:
1. Read the error messages
2. Fix the hsmeta files
3. Re-run lint
4. Max 5 attempts

Do NOT proceed until linting passes.

## Step 3: Check Object Name Approval

**CRITICAL: First-time upload requires approved object names.**

1. Check if this is the first upload for the project (no previous builds in our database)
2. If first upload and app objects exist, STOP and warn the user:

> "This is the first upload. Before I can proceed, please confirm:
>
> 1. **Object names are approved** by HubSpot for your developer account:
>    - `<LIST OBJECT NAMES>`
>    - If not approved yet, submit them here: https://app.hubspot.com/l/developer-overview/appObjectsEventsRequest
>    - Approval takes ~2-4 weeks
>
> 2. **Object names are correct** — they are PERMANENT and cannot be changed after upload.
>
> 3. **Properties are correct** — they are APPEND-ONLY and cannot be removed after upload.
>
> 4. **OAuth redirect URL** is not a placeholder — check `app-hsmeta.json` redirectUrls.
>
> 5. **Webhook target URL** is not a placeholder — check `webhooks-hsmeta.json` targetUrl."

Wait for user confirmation before proceeding.

## Step 4: Upload to HubSpot

```bash
hs project upload
```

This command:
- Validates the project structure
- Builds the app on HubSpot's servers
- Deploys to all existing installs immediately (if any)

**WARNING:** This affects ALL installs. There is no staged rollout.

## Step 5: Monitor Build Status

Watch the upload output for:
- **Success:** "Build succeeded" or similar confirmation
- **Failure:** Parse the error message and proceed to error recovery

If the build takes too long, check status:
```bash
hs project logs
```

## Step 6: Handle Build Errors

If the upload fails, use the `hubspot-fix-build-error` skill to:
1. Parse the specific error
2. Fix the hsmeta file(s)
3. Re-upload

Max 5 retry attempts. If still failing after 5 attempts, report all errors to the user and stop.

## Step 7: Commit, Push, and Create PR

After successful upload:

```bash
git add .
git commit -m "Deploy: <brief description of what was uploaded>"
git push -u origin HEAD
gh pr create --base main --title "Deploy: <description>" --body "## Changes
<list of what was created/changed>

## HubSpot Build
- Status: Success
- App Objects: <list of objects created>
- Webhooks: <configured/not configured>
- OAuth Scopes: <list of scopes>

## Customer Action Required
- Review INTEGRATION.md for backend implementation details
- Set up OAuth callback endpoint
- Set up webhook receiver endpoint (if webhooks configured)

---
Deployed by Appnigma AI"
```

## Step 8: Register Build

Register the build in the backend:
- Call `register_hubspot_build` with appId, hubspotBuildId (from upload output), status, commitSha, and errorLog (if failed)
- This persists the build for the dashboard build history table

## Step 9: Report Results

Tell the user ALL of:
- **PR link** — so they can review the code
- **Build status** — success/failure
- **App objects created** — list with property counts
- **Webhooks configured** — list of event subscriptions
- **OAuth scopes** — what the app requests
- **Next steps:**
  - Review PR and merge
  - Implement backend per INTEGRATION.md
  - Install in test account (offer `hubspot-install-test-account` skill)
- **Reminder:** any future `hs project upload` updates ALL installs immediately
