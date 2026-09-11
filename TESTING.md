# Testing Guide — Leads_CRM

## Overview

This project uses a multi-layered testing strategy:

| Layer | Tool | Coverage Target | Location |
|-------|------|-----------------|----------|
| **Unit** | Vitest | 80% (lines/functions), 70% (branches) | `src/lib/**/*.test.ts` |
| **Component** | Vitest + RTL | 40% | `src/components/**/*.test.tsx` |
| **E2E** | Playwright | 6 critical paths + edge cases | `tests/e2e/*.spec.ts` |

---

## Running Tests

### Unit Tests (Pure Functions)

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Component Tests

```bash
npm run test:component
```

### E2E Tests

```bash
# Requires dev server running
npm run dev  # in another terminal

# Run E2E tests
npm run test:e2e

# With UI
npm run test:e2e:ui
```

### Full CI Pipeline

```bash
npm run test:ci
```

---

## Test Structure

```
src/
├── lib/
│   ├── leads/
│   │   ├── detect-duplicates.test.ts    # 35+ tests
│   │   ├── lead-scorer.test.ts          # 25+ tests
│   │   ├── compute-stats.test.ts        # 20+ tests
│   │   ├── merge-leads.test.ts          # 12+ tests
│   │   ├── filter-leads.test.ts         # 15+ tests
│   │   ├── validate-lead.test.ts        # 10+ tests
│   │   └── work-queues.test.ts          # 10+ tests
│   ├── ai/
│   │   └── pain-analysis.test.ts        # 30+ tests
│   ├── geo/
│   │   └── cities.test.ts               # 25+ tests
│   ├── utils/
│   │   └── email-plain.test.ts          # 8+ tests
│   └── domain/
│       └── lead.test.ts                 # 8+ tests
├── components/
│   └── leads/
│       ├── lead-table.test.tsx          # 12+ tests
│       ├── lead-drawer.test.tsx         # 15+ tests
│       ├── lead-filters.test.tsx        # 10+ tests
│       ├── email-editor.test.tsx        # 8+ tests
│       └── pain-analysis-section.test.tsx # 8+ tests
tests/
├── e2e/
│   └── critical-paths.spec.ts           # 7 paths + 6 edge cases
├── factories/
│   └── lead.ts                          # Test data factories
└── mocks/
    ├── handlers.ts                      # MSW handlers
    └── server.ts                        # MSW server
```

---

## Writing Unit Tests

### Conventions

- **File naming**: `*.test.ts` / `*.test.tsx`
- **Describe blocks**: Group by function/feature
- **Test names**: `it('should do X when Y')`
- **AAA pattern**: Arrange → Act → Assert

### Example

```typescript
import { describe, it, expect } from 'vitest'
import { normalizeEmail } from '@/lib/leads/detect-duplicates'

describe('normalizeEmail', () => {
  it('lowercases email', () => {
    expect(normalizeEmail('TEST@DOMAIN.COM')).toBe('test@domain.com')
  })

  it('removes +alias', () => {
    expect(normalizeEmail('user+tag@domain.com')).toBe('user@domain.com')
  })

  it('returns null for public domains', () => {
    expect(normalizeEmail('test@gmail.com')).toBeNull()
  })
})
```

### Mocking External APIs

Use MSW handlers in `tests/mocks/handlers.ts`:

```typescript
http.get('https://api.notion.com/v1/data-sources/:id/query', () => {
  return HttpResponse.json({ results: [...] })
})
```

The server is auto-started/stopped in `vitest.setup.ts`.

---

## Writing Component Tests

### Conventions

- Use `@testing-library/react` queries (`getByRole`, `getByLabelText`, `getByText`)
- Test user interactions, not implementation details
- Mock callbacks with `vi.fn()`

### Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadTable } from '@/components/leads/lead-table'

it('calls onStatusChange when select changes', () => {
  const onStatusChange = vi.fn()
  render(<LeadTable leads={mockLeads} onStatusChange={onStatusChange} />)

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Validado' } })

  expect(onStatusChange).toHaveBeenCalledWith('lead-1', 'Validado')
})
```

---

## Writing E2E Tests

### Conventions

- Use `data-testid` for reliable selectors
- Test critical user paths
- Include one edge case per feature
- Run against built production bundle

### Example

```typescript
test('Lead Detail: edit status persists', async ({ page }) => {
  await page.goto('/leads')
  await page.locator('tbody tr').first().click()

  await page.getByRole('combobox', { name: /estado/i }).selectOption('Validado')
  await expect(page.getByText('Estado actualizado')).toBeVisible()

  await page.reload()
  await expect(page.locator('tbody tr').first()).toContainText('Validado')
})
```

---

## Debugging Tests

### Unit/Component

```bash
# Run specific test file
npx vitest run src/lib/leads/detect-duplicates.test.ts

# Debug in VS Code
# Add breakpoint, then run "Debug: Vitest" launch config
```

### E2E

```bash
# Headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/critical-paths.spec.ts

# Trace viewer
npx playwright show-trace trace.zip
```

---

## Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
thresholds: {
  lines: 80,
  functions: 80,
  branches: 70,
  statements: 80,
}
```

View HTML report after `npm run test:coverage`:

```bash
open coverage/index.html
```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint & TypeCheck** - ESLint + TypeScript
2. **Unit Tests** - With coverage upload
3. **Component Tests**
4. **E2E Tests** - Against built app
5. **Docker Build** - Verify container builds

All jobs must pass for PR merge.

---

## Test Data Factories

Use `tests/factories/lead.ts` for consistent test data:

```typescript
import { createLead, createLeadsArray, createDuplicateGroup } from '@/tests/factories/lead'

const lead = createLead({ status: 'Validado', score: 80 })
const leads = createLeadsArray(10)
const duplicates = createDuplicateGroup({ companyName: 'Test' }, 3)
```

---

## Adding New Tests

1. Identify layer (unit/component/E2E)
2. Create test file next to source (unit/component) or in `tests/e2e/`
3. Follow existing patterns
4. Run locally: `npm run test:unit` / `npm run test:component` / `npm run test:e2e`
5. Ensure CI passes

---

## Common Patterns

### Async/Await in Tests

```typescript
it('handles async operation', async () => {
  const result = await someAsyncFunction()
  expect(result).toBeTruthy()
})
```

### Testing Error Boundaries

```typescript
it('shows error message', () => {
  render(<Component error="Test error" />)
  expect(screen.getByText('Test error')).toBeInTheDocument()
})
```

### Testing Loading States

```typescript
it('shows skeleton while loading', () => {
  render(<Component isLoading />)
  expect(screen.getByTestId('skeleton')).toBeInTheDocument()
})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ReferenceError: vi is not defined` | Add `globals: true` to vitest.config.ts |
| MSW not intercepting | Ensure `server.listen()` in setup, check `onUnhandledRequest` |
| Playwright timeout | Increase timeout, check `baseURL`, verify dev server |
| Coverage below threshold | Add tests for uncovered lines, check `exclude` in config |
| Flaky E2E | Add `waitForLoadState`, use `data-testid`, retry in CI |

---

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)