# Architecture
- Classify paid lead origin in the database with Google click IDs taking precedence over stale Meta cookies, so all ingestion paths agree.
- Store campaign category rules in a protected public table and apply them at ingestion, so categorization is shared across devices.
- Receive Evolution messages through a server-only authenticated webhook with transactional message deduplication, so retries and outgoing messages cannot inflate lead counts.
- Gate shared CRM data by server-validated admin/atendente roles, restrict deletion and integration logs to admins, and keep audit writes server-only to prevent unapproved accounts and forged histories.
- Keep Evolution credentials and provider requests server-only with allowlisted actions, so browser storage and arbitrary URLs cannot expose WhatsApp access.