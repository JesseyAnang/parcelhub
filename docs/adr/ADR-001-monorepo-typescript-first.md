# ADR-001: TypeScript-first monorepo with npm workspaces

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

ParcelHub has a React web app, a React Native app, Lambda services, CDK infrastructure and at least one carrier adapter. They all share a domain model: bookings, parcels, tracking events and statuses. If each part defines these types separately, they drift apart. For example, the API might accept a status the mobile app can't display.

One developer works on ParcelHub at about 15 hours a week, so tooling overhead has to stay low.

## Decision

1. **One repository with npm workspaces:** `apps/*`, `services/*`, `packages/*` and `infra`.
2. **TypeScript in strict mode everywhere a JavaScript runtime is involved**, including the infrastructure (AWS CDK in TypeScript).
3. **`@parcelhub/shared-types` is the single source of the domain contract.** It also holds validation that is shared, so the web form and the API enforce the same booking rules (`validateBooking`).
4. Shared packages are consumed **as TypeScript source**, with no build step. Vite, Vitest and esbuild (through CDK's `NodejsFunction`) compile them directly.
5. **Go is allowed for carrier adapters** (`adapters/carrier-go`), behind a language-neutral JSON contract, because adapters are separate Lambdas. That contract will be defined in week 6.

## Alternatives considered

- **pnpm or Nx/Turborepo:** faster installs and task caching, but another tool to learn and install. npm comes with Node and is enough at this size. Revisit if CI gets slow.
- **Separate repos per app or service:** clearer ownership in a large organisation, but cross-repo type sharing needs a package registry and versioning. That's too much overhead for one developer.
- **Generating types from OpenAPI:** a good option once the API is stable (week 2 adds an OpenAPI spec), but the spec would become a second source of truth this early.

## Consequences

- Changing a shared type breaks the type check in every consumer in the same PR. This is deliberate: the CI type check is the contract test.
- `npm test` at the root runs every workspace's tests, and `npm run synth` proves the infrastructure compiles.
- Expo (week 7) has its own monorepo rules and React version pins, which may force version alignment with `apps/web`.
- The Go adapter can't import the TypeScript types. Its JSON contract needs its own contract tests (week 6).
