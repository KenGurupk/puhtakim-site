# PushTakim

Production-ready Next.js App Router website for PushTakim.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Vercel-ready project structure

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Ticket System Integration

Ticket-related UI reads from typed event data and links through `lib/tickets.ts`. Replace the `StaticTicketProvider` with a provider backed by the future ticketing API, then update `app/api/tickets/availability/route.ts` to expose live inventory.
