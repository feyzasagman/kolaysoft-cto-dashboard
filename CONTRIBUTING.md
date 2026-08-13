# Contributing

Thanks for contributing to **Kolaysoft CTO Dashboard**.

This guide describes a lightweight collaboration workflow. Automated validation is enforced by **GitHub Actions → CI Quality Gate** (Backend Quality → Frontend Quality → Full Stack E2E). Local checklists and PR boxes do **not** replace CI.

## Development Flow

1. Open or pick an Issue / task  
2. Create a branch  
3. Implement a focused change  
4. Run local quality checks  
5. Open a Pull Request (use the PR template)  
6. Wait for **CI Quality Gate**  
7. Address review feedback  
8. Merge when CI is green and review is complete  

## Branch Naming

Recommended conventions for future collaboration (history may have worked directly on `main` during internship delivery — that does not redefine the preferred workflow):

- `feature/<short-name>`
- `fix/<short-name>`
- `test/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`

Keep branches small and short-lived.

## Commit Convention

Prefer conventional prefixes already used in this repo:

- `feat:`
- `fix:`
- `test:`
- `ci:`
- `build:`
- `docs:`
- `chore:`
- `refactor:`

Do not commit secrets (`.env`, credentials, JWT secrets).

## Local Quality Checks

Commands below match current `pom.xml` / `frontend/package.json` scripts.

### Backend

```powershell
cd backend/cto-dashboard-api
./mvnw.cmd test
./mvnw.cmd clean verify
```

`clean verify` runs tests, packages the app, and produces the JaCoCo report under `target/site/jacoco/` (not committed).

### Frontend

```powershell
cd frontend
npm run lint
npm run test:run
# or: npm run test:coverage
npm run build
```

### Playwright E2E

Requires Postgres + backend (and `frontend/.env.e2e` — see `.env.e2e.example`).

```powershell
cd frontend
npm run test:e2e
```

## Pull Requests

- Keep PRs small and focused on one concern  
- Fill the PR template (summary, validation, security/data, breaking changes)  
- Link related issues (`Closes #…`) when applicable  
- UI changes: add a short screenshot note  

## Database Changes

- Schema changes require a **new Flyway migration** under `backend/cto-dashboard-api/src/main/resources/db/migration/`  
- Do **not** edit an existing migration that may already have been applied (local Docker volumes, CI, or demos)  
- Hibernate stays on `ddl-auto=validate` — entities and migrations must stay aligned  

## Security

- Never commit `.env`, `.env.docker`, `.env.e2e`, or real secrets  
- Demo seed credentials (`DevDataInitializer`) are **DEMO ONLY** — not for production  
- Do not paste JWT tokens, passwords, or personal data into Issues/PRs  

## Documentation

If behavior, setup, or architecture changes, update the relevant `README.md` and/or `docs/**` files in the same PR when practical.

Architecture decisions: [`docs/architecture/adr/README.md`](docs/architecture/adr/README.md).

## Dependency Updates

Dependency update PRs (including Dependabot, if enabled) require:

1. Green **CI Quality Gate**  
2. Manual review (no auto-merge)  

Prefer minimal version bumps and verify backend tests / frontend lint+tests+build.

## Issue Templates

Use GitHub Issue forms:

- **Bug Report** — reproducible defects  
- **Feature Request** — problem → solution → acceptance criteria  

Blank issues are disabled.
