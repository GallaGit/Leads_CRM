import { test, expect } from '@playwright/test'

test.describe('Leads_CRM Critical Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')
  })

  test('Sync Flow: data loads and sync indicator shows', async ({ page }) => {
    await expect(page.getByText('Sincronizado')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 })
    const leadCount = await page.locator('tbody tr').count()
    expect(leadCount).toBeGreaterThan(0)
  })

  test('Lead Detail & Edit: open drawer, edit status/notes/favorite', async ({ page }) => {
    await page.locator('tbody tr').first().click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('combobox', { name: /estado/i }).selectOption('Validado')
    await expect(page.getByText('Estado actualizado')).toBeVisible({ timeout: 5000 })

    await page.getByRole('tab', { name: /notas/i }).click()
    await page.getByLabelText(/notas/i).fill('Updated notes from E2E')
    await page.getByText('Guardar').click()
    await expect(page.getByText('Notas actualizadas')).toBeVisible({ timeout: 5000 })

    await page.getByLabelText(/favorito/i).click()
    await expect(page.getByText('Favorito actualizado')).toBeVisible({ timeout: 5000 })

    await page.getByLabelText(/cerrar/i).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    await page.locator('tbody tr').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabelText(/notas/i)).toHaveValue('Updated notes from E2E')
  })

  test('Kanban Drag & Drop: move card between columns', async ({ page }) => {
    await page.goto('/kanban')
    await page.waitForLoadState('networkidle')

    const sourceCard = page.locator('[data-column="Nuevo"] [data-testid="kanban-card"]').first()
    const targetColumn = page.locator('[data-column="Validado"]')

    await expect(sourceCard).toBeVisible()

    await sourceCard.dragTo(targetColumn)

    await expect(page.getByText('Estado actualizado')).toBeVisible({ timeout: 5000 })

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-column="Validado"] [data-testid="kanban-card"]').first()).toBeVisible()
  })

  test('Duplicates Merge: compare and merge duplicate leads', async ({ page }) => {
    await page.goto('/duplicates')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Grupos de duplicados')).toBeVisible()

    const firstGroup = page.locator('[data-testid="duplicate-group"]').first()
    await expect(firstGroup).toBeVisible()

    await firstGroup.click()

    await expect(page.getByText('Comparar leads')).toBeVisible()

    await page.getByText('Fusionar').click()

    await expect(page.getByText('¿Fusionar leads?')).toBeVisible()
    await page.getByText('Confirmar').click()

    await expect(page.getByText('Leads fusionados')).toBeVisible({ timeout: 5000 })

    await page.goto('/leads')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Archived Lead')).not.toBeVisible()
  })

  test('AI Analysis: detect dolores renders three sections', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')

    await page.locator('tbody tr').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('tab', { name: /dolores/i }).click()

    await page.getByText('Detectar dolores').click()

    await expect(page.getByText('Analizando...')).toBeVisible()

    await expect(page.getByText('Evidencia')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Inferencia')).toBeVisible()
    await expect(page.getByText('Especulación')).toBeVisible()

    await expect(page.locator('text=• ').first()).toBeVisible()
  })

  test('Settings Connection Tests: test Notion/Groq/n8n connections', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /probar notion/i }).click()
    await expect(page.getByText(/conectado/i)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /probar groq/i }).click()
    await expect(page.getByText(/conectado/i)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /probar n8n/i }).click()
    await expect(page.getByText(/conectado/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Edge Cases', () => {
  test('Sync error shows retry button', async ({ page }) => {
    await page.route('**/api/sync', route => route.abort())
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/error/i)).toBeVisible()
    await expect(page.getByText(/reintentar/i)).toBeVisible()
  })

  test('Lead edit error shows toast and reverts', async ({ page }) => {
    await page.route('**/api/leads/**', route => route.fulfill({ status: 500, body: 'Server Error' }))
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')

    await page.locator('tbody tr').first().click()
    await page.getByRole('combobox', { name: /estado/i }).selectOption('Validado')

    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 })
  })

  test('Kanban drag to same column does not trigger PATCH', async ({ page }) => {
    await page.goto('/kanban')
    await page.waitForLoadState('networkidle')

    const sourceCard = page.locator('[data-column="Nuevo"] [data-testid="kanban-card"]').first()
    const sourceColumn = page.locator('[data-column="Nuevo"]')

    await sourceCard.dragTo(sourceColumn)

    await page.waitForTimeout(500)
    await expect(page.getByText('Estado actualizado')).not.toBeVisible()
  })

  test('Duplicates merge with no empty fields only archives', async ({ page }) => {
    await page.goto('/duplicates')
    await page.waitForLoadState('networkidle')

    const firstGroup = page.locator('[data-testid="duplicate-group"]').first()
    await firstGroup.click()

    await page.getByText('Fusionar').click()
    await page.getByText('Confirmar').click()

    await expect(page.getByText('Lead archivado')).toBeVisible({ timeout: 5000 })
  })

  test('AI analysis error does not corrupt lead', async ({ page }) => {
    await page.route('**/api/leads/**/analyze', route => route.fulfill({ status: 502, body: '{"error":{"code":"ai_error"}}' }))
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')

    await page.locator('tbody tr').first().click()
    await page.getByRole('tab', { name: /dolores/i }).click()
    await page.getByText('Detectar dolores').click()

    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 10000 })

    await page.getByLabelText(/cerrar/i).click()
    await page.locator('tbody tr').first().click()
    await page.getByRole('tab', { name: /dolores/i }).click()

    await expect(page.getByText('Evidencia')).not.toBeVisible()
  })

  test('Settings save invalid URL shows validation error', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    await page.getByLabelText(/webhook n8n/i).fill('not-a-url')
    await page.getByText('Guardar').click()

    await expect(page.getByText(/url inválida/i)).toBeVisible()
  })
})