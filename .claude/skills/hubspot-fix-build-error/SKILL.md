---
name: hubspot-fix-build-error
description: "Parses HubSpot project upload errors and fixes the underlying issues: handles object name approval failures, property type mismatches, missing required fields, invalid uid formats, and scope errors. Use when hs project upload fails and you need to diagnose and fix the problem."
---

# Fix HubSpot Build Errors

Use this skill when `hs project upload` fails. Parse the error output, fix the specific file(s), and re-upload.

## Error Diagnosis Flow

1. Read the full error output from `hs project upload`
2. Match against known error patterns below
3. Fix the specific file
4. Re-run `hs project upload`
5. Max 5 attempts — if still failing, report to user

## Common Errors and Fixes

### "Object name is not in the allowlist for portal"

**Cause:** The app object name has not been approved by HubSpot for this developer account.

**Fix:** This cannot be fixed in code. Tell the user:

> "The object name `<NAME>` hasn't been approved by HubSpot yet. You need to:
> 1. Submit the name for approval: https://app.hubspot.com/l/developer-overview/appObjectsEventsRequest
> 2. Wait for HubSpot to approve (~2-4 weeks)
> 3. Once approved, I can re-upload.
>
> The object name must be submitted in UPPER_SNAKE_CASE exactly as it appears in the hsmeta file: `<NAME>`"

Do NOT retry upload — this will fail until the name is approved.

### Property Type Mismatch

**Cause:** Invalid combination of `type` and `fieldType` in a property definition.

**Valid combinations:**
| type | Valid fieldTypes |
|---|---|
| `string` | `text`, `textarea`, `file` |
| `number` | `number` |
| `enumeration` | `select`, `radio`, `checkbox`, `booleancheckbox` |
| `date` | `date` |
| `dateTime` | `date` |

**Fix:** Update the property in the app object hsmeta file to use a valid combination.

### Missing Required Fields

**Cause:** An hsmeta file is missing required fields.

**Required fields for app objects:**
- `uid` — unique identifier (snake_case)
- `type` — must be `"app-object"`
- `config.name` — UPPER_SNAKE_CASE object name
- `config.singularForm` — display name (singular)
- `config.pluralForm` — display name (plural)
- `config.primaryDisplayLabelPropertyName` — must reference an existing property name
- `config.properties` — at least one property

**Required fields for associations:**
- `uid` — unique identifier
- `type` — must be `"app-object-association"`
- `config.firstObjectType` — uid of the app object
- `config.secondObjectType` — standard object name (CONTACT, COMPANY, DEAL, TICKET) or another app object uid

**Required fields for webhooks:**
- `uid` — unique identifier
- `type` — must be `"webhooks"`
- `config.targetUrl` — HTTPS URL

**Fix:** Add the missing field(s) to the hsmeta file.

### Invalid uid Format

**Cause:** The `uid` field contains invalid characters.

**Rules:**
- Must be snake_case (lowercase letters, numbers, underscores)
- Must be unique across all hsmeta files in the project
- No spaces, hyphens, or special characters

**Fix:** Update the `uid` to valid snake_case format.

### Scope Errors

**Cause:** The app's OAuth scopes in `app-hsmeta.json` don't include required scopes for the configured features.

**Common missing scopes:**
- App objects exist but missing `crm.objects.custom.read` / `crm.objects.custom.write`
- Association with contacts but missing `crm.objects.contacts.read`
- Association with companies but missing `crm.objects.companies.read`
- Association with deals but missing `crm.objects.deals.read`
- Association with tickets but missing `crm.objects.tickets.read`

**Fix:** Add the missing scope(s) to `app-hsmeta.json` → `config.auth.requiredScopes`.

### Invalid `platformVersion`

**Cause:** `hsproject.json` specifies an unsupported platform version.

**Fix:** Set `platformVersion` to `"2026.03"` (current stable, requires CLI ≥ 8.3.0).

### Invalid JSON

**Cause:** Malformed JSON in an hsmeta file.

**Fix:** Parse the JSON error message to find the line/character position. Fix the syntax error (missing comma, bracket, quote, etc.).

### `primaryDisplayLabelPropertyName` References Non-existent Property

**Cause:** The `primaryDisplayLabelPropertyName` or `secondaryDisplayLabelPropertyNames` reference a property name that doesn't exist in the `properties` array.

**Fix:** Either add the missing property or update the display label reference to point to an existing property.

## After Fixing

1. Re-run `hs project upload`
2. If it fails again with a different error, repeat the diagnosis
3. If it fails with the same error, re-read the error carefully — the fix may not have been applied correctly
4. After 5 failed attempts, stop and report all errors to the user

## Report

Tell the user:
- What error was encountered
- What was fixed (file, field, value)
- Whether the re-upload succeeded
- If unfixable (e.g., object name approval), explain the blocker and next steps
