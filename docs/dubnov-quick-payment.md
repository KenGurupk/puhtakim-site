# Dubnov quick payments

This adds a separate /classes/dubnov-kids/quick-payment route. The first-registration form and /dubnov monthly-renewal redirect are unchanged. This feature is disabled until the merchant's Grow Light API configuration is supplied.

## Merchant setup before activation

Configure these server-side variables in the existing Vercel project, in the intended environment:

- GROW_API_ORIGIN: the exact HTTPS API origin supplied by Grow for this merchant. No production endpoint is inferred from the existing pay.grow.link links.
- GROW_USER_ID and GROW_PAGE_CODE: merchant-specific Light API identifiers issued/authorized by Grow. Do not use documentation examples or copy identifiers from a public payment-link URL.
- GROW_VAT_TYPE: 1 for prices including VAT, or 3 for a tax-exempt merchant; confirm the business's actual invoice setting. The final customer price stays 90 ILS per session.
- GROW_QUICK_PAYMENT_ENABLED=true only after confirming that this account's hosted payment page freezes the API-set sum and copies productData into the receipt.
- Existing KV_REST_API_URL and KV_REST_API_TOKEN must be present.
- ADMIN_USERNAME and ADMIN_PASSWORD must be configured, or ADMIN_SESSION_SECRET must be set for the existing fallback password. The public source-code hash is no longer accepted as a signing secret.

No credentials should be committed, pasted into a PR, included in logs, or sent to the browser.

The merchant's Grow receipt settings must generate and send the document. The API request sends the child, month, quantity, unit price and total in description and productData. invoiceNotifyUrl records the receipt number after a process/transaction match. Do not activate this route if the merchant's invoice template discards the item description.

## Existing registrations and health

Identify the existing child with the child's exact registered name, birth date and guardian phone. Only a Dubnov registration with five saved health answers, completed health declaration, accepted terms and guardian consent qualifies. Legacy retries with the same identity link to the earliest completed declaration.

The original registration and answers are never overwritten. Each quick payment holds registrationId. A short no-change confirmation or a free-text update is saved separately in the existing private KV store before creating the Grow process. A changed condition is flagged for coach review before attendance. No health data is sent to Grow, added to a URL, saved in browser storage, or logged.

## Price and payment evidence

The server computes 90 ILS times an integer session count (1–31) for a selected YYYY-MM. Client-supplied totals are ignored. Every Grow process is created server-side with a fixed sum, a single invoice item with price 90 and the chosen quantity, and a unique checkout reference in cField1.

A pending sales record is created before redirecting. Idempotency prevents repeated clicks from creating duplicate processes. A timeout does not silently create a second process. Process identifiers/tokens and callback keys remain server-only, separate from sales/admin responses.

The callback ignores status/card fields from the incoming request. It queries getPaymentProcessInfo with server-held process credentials, requires one verified paid transaction (statusCode 2 and status שולם), and checks the exact expected amount. Transaction ownership and status are stored atomically in Redis. approveTransaction acknowledges the verified provider response. Only transient card fields required by that acknowledgement are forwarded to Grow; they are not stored or exported.

The old webhook cannot settle this new purchase type. The return page only reads the stored status with a per-purchase bearer token; opening it never marks a payment paid. Receipt callbacks require a private callback key, verify the process with Grow, and match the transaction before saving invoiceNumber.

## Admin

Open /admin, sign in, then use the דובנוב — תשלומים מהירים panel and its חודש למעקב selector. It shows child, month, sessions, amount, payment state, transaction and receipt IDs. צפייה בטופס ובעדכון reveals the private confirmation/update; פתיחת ההרשמה וההצהרה המקוריות opens the existing form viewer. Health endpoints check the admin session themselves and return private, no-store responses. No public health files or download links are created.

## Verification

The quick-payment Playwright suite exercises a synthetic Doron registration with three sessions in October 2026, totaling 270 ILS, plus browser price tampering, incomplete registration, a health update, callback spoofing, amount mismatch, duplicate callbacks, receipt association, idempotency and admin access. It runs against the real app and a disposable Redis, with a test-only Grow HTTP adapter.

These integration tests do not constitute a transaction with the real merchant. Before production activation, use the merchant's actual Grow sandbox credentials to open the payment page for 270 ILS and inspect the generated receipt text. Then verify the registered child record with the authorized administrator; do not create a real charge without the parent's participation.

API contract references:
- https://developers.grow.business/reference/create-payment-process
- https://developers.grow.business/reference/get-payment-process-info
- https://developers.grow.business/reference/server-to-server-callback
- https://developers.grow.business/reference/approve-transaction-1
- https://developers.grow.business/reference/invoice-server-response

During implementation the contract was read from the June 2026 snapshot at https://github.com/Shaharamir/grow-payments-mcp (an unofficial mirror). Production details must be confirmed against Grow's official documentation and the merchant's assigned configuration.
