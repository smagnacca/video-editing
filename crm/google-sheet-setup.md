# Google Sheet Sync — Optional Setup (Plan B)

> **You don't need to do this** unless you want to view/edit the CRM from your phone or browser.
> The local markdown CRM in `crm/` is the source of truth. The Sheet is just a mirror.

## Why It's Not Auto-Created

The service account at `~/.claude/tokens/google-service-account.json` doesn't have its own Drive
storage and can't enable the Sheets API on its project. So the one-time setup needs you to do
two clicks. After that, Claude takes over.

## One-Time Setup (60 seconds)

1. Go to **sheets.new** — creates a blank sheet.
2. Rename it: **"Scott Magnacca - Sales Funnel CRM"**
3. Click **Share** (top right) → paste this email as Editor:
   ```
   emailbot@email-robot-491000.iam.gserviceaccount.com
   ```
4. Copy the URL from your browser (looks like `docs.google.com/spreadsheets/d/<ID>/edit`)
5. Tell Claude: **"My CRM sheet ID is <ID>"** — Claude will save it and run the first sync.

After that, anytime you say **"sync the CRM to Google Sheets"**, Claude pushes the latest
`crm/leads.md`, activity log, weekly plan, content calendar, and metrics dashboard into the sheet.

## What the Sheet Will Have

- **Leads** tab — full pipeline with funnel-stage dropdown
- **Activity Log** tab — every prospect touch, timestamped
- **Weekly Plan** tab — current week's prospecting targets + actuals
- **Content Calendar** tab — 12-week video schedule + performance
- **Metrics** tab — funnel-health dashboard with conversion rates
