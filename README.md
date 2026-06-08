# Demo 3 — Content Automation

An n8n workflow that turns a single **topic** into a structured, publish-ready first draft and pushes it straight into your content pipeline (Notion + Google Sheets).

This is a portfolio demo. It is safe to share publicly — all credentials are placeholders.

## What it does

1. **Topic Form Trigger** — collects a topic, target audience, tone and optional keywords (no credential needed).
2. **AI Agent: Draft** — an LLM (via **OpenAI Chat Model**) writes the draft and, using a **Structured Output Parser**, returns strict JSON:
   - `title`, `slug`, `meta_description`
   - `outline` (array)
   - `draft_markdown`
   - `tags` (array)
3. **Notion: Create Draft Page** — creates a new page in your content database.
4. **Google Sheets: Log Draft** — logs the draft metadata for tracking.

```
Topic Form Trigger
        |
AI Agent: Draft  (OpenAI Chat Model + Structured Output Parser)
        |-- Notion: create draft page
        '-- Google Sheets: log draft
```

## Stack

- **n8n** (workflow automation)
- **OpenAI** — chat model for drafting
- **Notion** — drafts database
- **Google Sheets** — content log

## Setup

1. Import `workflow.json` into your n8n instance (**Workflows -> Import from File**).
2. Create and connect your own credentials: OpenAI, Notion, Google Sheets (OAuth2).
3. Credential ids in `workflow.json` are placeholders (`REPLACE_WITH_YOUR_CREDENTIAL_ID`) — re-select your own credentials in each node.
4. Replace `YOUR_NOTION_DATABASE_ID` and `YOUR_GOOGLE_SHEET_ID` with your own.
5. Make sure the Google Sheet has a sheet named `Content`, then run the form.

## Security notes

- No secrets are committed to this repo. Credential ids are placeholders; raw keys live only inside your n8n instance (encrypted).
- For demos, use a **throwaway OpenAI key with a hard spending limit**, and revoke it after recording.
- Never give a client a login to your n8n instance — share a video / screenshots instead.

## License

MIT
