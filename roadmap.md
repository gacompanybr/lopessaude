# CRM integration
- [x] Correct attribution precedence and reclassify October Google leads (7 corrected; October now has 9 Google Ads and 1 Site).
- [x] Add campaign/category display, filters and admin-only editable campaign rules.
- [x] Deploy secure Evolution inbound webhook and configuration control.
- [x] Verify CRM filters with the available preview session; five inbound parser tests passed; unauthorized webhook requests rejected.
- [ ] Activate and verify Evolution ingestion end-to-end. Blocker: the preview session cannot authenticate to the admin setup function; the requesting user's own email has no matching auth account. An administrator must sign in and use Configurações → Verificar recepção / Ativar recepção no CRM. Existing Evolution destinations are preserved.
- [ ] Recover historical off-site contacts, if required. Blocker: no historical WhatsApp contact export or confirmed provider access is available; ad platform totals alone cannot reconstruct named contacts or campaign attribution.