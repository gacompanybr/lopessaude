# Architecture
- Classify paid lead origin in the database with Google click IDs taking precedence over stale Meta cookies, so all ingestion paths agree.
- Store campaign category rules in a protected public table and apply them at ingestion, so categorization is shared across devices.
- Receive Evolution messages through a server-only authenticated webhook with transactional message deduplication, so retries and outgoing messages cannot inflate lead counts.