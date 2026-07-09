# Contributing to Inkwell

Thank you for your interest in contributing. Please read this guide before opening issues or
pull requests.

## Development setup

1. Fork and clone the repository.
2. Follow the **Local setup** steps in `docs/DEVELOPER_GUIDE.md`.
3. Create a feature branch: `git checkout -b feature/your-feature`.
4. Make your changes following the conventions below.
5. Run the full validation suite (see below) before pushing.
6. Open a pull request against `main` with a clear description.

## Validation before opening a PR

Backend:
```
cd backend
npm test
npm run build
npx tsc -p tsconfig.json --noEmit
```

Frontend:
```
cd frontend
npm test
npx tsc -b --noEmit
npm run build
```

All checks must pass. PRs with failing tests or type errors will not be merged.

## Code conventions

- **One resource per file** in `api/`, `hooks/`, `routes/`, and `controllers/`.
- **No `res.json()` directly** in controllers — always use `utils/sendResponse.ts`.
- **No `apiClient` calls in components** — add to `api/*.ts` and wrap in a hook.
- **Errors in controllers** — throw `ApiError.xxx()`, never catch-and-format inline.
- **New pages** — add as a `lazy()` import wrapped by the `page()` helper in `App.tsx`.
- **TypeScript strict mode** is on for both apps; `any` casts require a comment explaining why.

## Commit messages

Use the Conventional Commits format:
- `feat: ...` for new user-facing features
- `fix: ...` for bug fixes
- `refactor: ...` for internal changes with no behaviour change
- `test: ...` for test additions or corrections
- `docs: ...` for documentation only
- `chore: ...` for build/tooling/dependency changes

## Issues

Search existing issues before opening a new one. Security issues must be reported privately
via the process in `SECURITY.md` — do not open a public issue for a vulnerability.
