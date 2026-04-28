---
name: hubspot-create-app-object
description: "Designs and generates HubSpot App Object schemas from user requirements: maps data to property types, creates hsmeta JSON files, generates association configs for standard objects, and updates OAuth scopes. Use when the user describes data they want to store or asks to create a custom object."
---

# Create a HubSpot App Object

Use this skill when the user describes data they want to store in HubSpot. App Objects are custom objects that are created automatically when a customer installs the app.

## Step 1: Understand the Data

Ask the user what data they need to store. Identify:
- **Object name** — what is this thing? (e.g., "Onboarding Milestone", "Support Ticket", "Project Task")
- **Properties** — what fields does it have? (name, status, date, description, etc.)
- **Associations** — does it relate to contacts, companies, deals, or tickets?

## Step 2: Design the Schema

Map user requirements to HubSpot property types:

| User says | Type | fieldType | Notes |
|---|---|---|---|
| Text, name, title | `string` | `text` | Single-line, max 65,536 chars |
| Description, notes, long text | `string` | `textarea` | Multi-line |
| File, attachment | `string` | `file` | File reference |
| Number, amount, count, quantity | `number` | `number` | Up to one decimal |
| Status, category, type (fixed options) | `enumeration` | `select` | Dropdown |
| Status (few options, visual) | `enumeration` | `radio` | Radio buttons |
| Tags, multi-select | `enumeration` | `checkbox` | Multi-select checkboxes |
| Yes/no, boolean | `enumeration` | `booleancheckbox` | True/false |
| Date (no time) | `date` | `date` | ISO 8601 YYYY-MM-DD |
| Date with time | `dateTime` | `date` | ISO 8601 with time |

**Naming rules:**
- Object name: `UPPER_SNAKE_CASE` (e.g., `ONBOARDING_MILESTONE`)
- Property names: `lower_snake_case` (e.g., `milestone_name`, `due_date`)

## Step 3: WARN — Names and Properties Are Permanent

**CRITICAL: Before proceeding, warn the user:**

> "Object names and properties are **permanent** once uploaded to HubSpot. They cannot be renamed or removed. Please confirm these are correct before I generate the files:
>
> **Object:** `<OBJECT_NAME>`
> **Properties:** `<list of property names and types>`
>
> Also note: new object names require HubSpot approval before the first upload (~2-4 weeks). Here's the approval form: https://app.hubspot.com/l/developer-overview/appObjectsEventsRequest"

Wait for user confirmation before proceeding.

## Step 4: Generate the App Object hsmeta File

Create `src/app/app-objects/<name>-object-hsmeta.json`:

```json
{
  "uid": "<object_name_lower>_object",
  "type": "app-object",
  "config": {
    "name": "<UPPER_SNAKE_CASE_NAME>",
    "appPrefix": "<AppName>",
    "description": "<What this object represents>",
    "singularForm": "<Singular Display Name>",
    "pluralForm": "<Plural Display Name>",
    "primaryDisplayLabelPropertyName": "<main_property_name>",
    "secondaryDisplayLabelPropertyNames": ["<secondary_property>"],
    "settings": {
      "hasRecordPage": true,
      "allowsUserCreatedRecords": true,
      "hasEngagements": true
    },
    "properties": [
      {
        "type": "<type>",
        "fieldType": "<fieldType>",
        "name": "<property_name>",
        "label": "<Display Label>",
        "description": "<What this property stores>"
      }
    ]
  }
}
```

For enumeration properties, include `options`:
```json
{
  "type": "enumeration",
  "fieldType": "select",
  "name": "status",
  "label": "Status",
  "options": [
    { "label": "Not Started", "value": "not_started", "displayOrder": 0 },
    { "label": "In Progress", "value": "in_progress", "displayOrder": 1 },
    { "label": "Complete", "value": "complete", "displayOrder": 2 }
  ]
}
```

## Step 5: Generate Association Files (if needed)

If the object relates to standard objects, create association files in `src/app/app-objects/app-object-associations/`:

**File:** `<name>-to-<standard>-hsmeta.json`

```json
{
  "uid": "<object_name>_to_<standard_lower>",
  "type": "app-object-association",
  "config": {
    "firstObjectType": "<object_uid from step 4>",
    "secondObjectType": "<STANDARD_OBJECT>",
    "firstToSecondBaseLimit": 5000,
    "secondToFirstBaseLimit": 100
  }
}
```

Standard object type values for associations: `CONTACT`, `COMPANY`, `DEAL`, `TICKET`.

HubSpot automatically associates app objects with: emails, meetings, notes, tasks, calls, conversations — no config needed for those.

## Step 6: Update OAuth Scopes in `app-hsmeta.json`

Add required scopes to `src/app/app-hsmeta.json`:

1. **Always add** (for any app with app objects):
   - `crm.objects.custom.read`
   - `crm.objects.custom.write`

2. **Add read scope** for each standard object the app associates with:
   - Contact association → `crm.objects.contacts.read`
   - Company association → `crm.objects.companies.read`
   - Deal association → `crm.objects.deals.read`
   - Ticket association → `crm.objects.tickets.read`

Do NOT add write scopes for standard objects unless the app explicitly needs to modify them.

## Step 7: Update `INTEGRATION.md`

Add an "App Objects" section describing:
- Object name and what it represents
- All properties with types and descriptions
- Associations with standard objects
- API endpoint pattern: `GET/POST /crm/v3/objects/a{appId}_{OBJECT_NAME}`
- Property names in API include app prefix: `a{appId}_{property_name}`

## Step 8: Commit

```bash
git add .
git commit -m "Add app object: <OBJECT_NAME>"
```

## Step 9: Report to User

Tell the user:
- What object was created with what properties
- What associations were configured
- What OAuth scopes were added
- Reminder: submit object name for HubSpot approval if not already done
- Next steps: add more objects, configure webhooks, or upload
