# tower-claims-next-action

A small, deterministic **claims next-action engine** for a digital insurer.

## Why this exists

Tower's HY26 results and public statements show a clear direction:
- 70% of NZ claims lodgement tasks are digital.
- The AI-enabled Amazon Connect contact centre reduced average handling time by 2 minutes 38 seconds.
- 1% of NZ motor claims in March were resolved end to end without a Tower human.
- The next horizon is customer data, digitisation and embedded AI.

The remaining customer-experience gap is not lodgement. It is **what happens next**: whether documents are missing, whether an excess is outstanding, whether an assessing claim has gone quiet, or whether a declined customer has a clear review path. This repo turns those signals into one deterministic next action and customer-facing copy that a React/TypeScript journey can render without a call.

It is a reference implementation, not affiliated with or deployed at Tower.

## API

```ts
nextBestAction({
  stage: "assessing",
  daysSinceCustomerUpdate: 6,
  missingItems: [],
  excessOutstanding: false
});
// { code: "request_update", title: "Request a progress update", priority: "high", customerMessage: "..." }
```

## Priority order

1. Missing documents
2. Declined decision — review path
3. Approved with excess outstanding
4. Assessing with no update for more than 5 days
5. Awaiting information
6. Lodged
7. Settled
8. No action

## Test and CI

```bash
npm ci
npm run build
npm test
```

GitHub Actions runs the same commands on Node 22. The engine is pure TypeScript with no runtime dependencies, so it can sit behind a React customer journey or a .NET API boundary.

## Boundaries

- No claim decisions, eligibility, pricing or coverage advice.
- No Tower customer data.
- The copy is a starting point for a regulated insurance journey; legal/compliance review is required before production use.
