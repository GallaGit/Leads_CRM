import { describe, it, expect } from 'vitest'
import {
  buildEmptyFieldMerge,
  computeMergePreview,
  isMergeFieldEmpty,
  formatMergeFieldValue,
  MERGEABLE_FIELD_KEYS,
} from '@/lib/leads/merge-leads'
import type { Lead } from '@/lib/domain/lead'

const createMockLead = (overrides: Partial<Lead> = {}): Lead =>
  ({
    id: `lead-${Math.random().toString(36).slice(2)}`,
    url: '',
    companyName: 'Test Company',
    website: 'https://test.com',
    phone: '+34 600 111 222',
    address: 'Calle Test 123',
    postalCode: '46001',
    city: 'Valencia',
    cityCanonical: 'Valencia',
    province: 'Valencia',
    employees: 10,
    linkedin: 'https://linkedin.com/company/test',
    services: ['Asesoría'],
    status: 'Nuevo' as const,
    lastActivity: new Date().toISOString(),
    createdAt: null,
    discoveredAt: new Date().toISOString(),
    notes: 'Original notes',
    notesOverflow: null,
    email: 'test@test.com',
    emailCommercial: null,
    emailManager: null,
    score: 50,
    manager: 'John Doe',
    role: 'CEO',
    confidence: 'Alta',
    software: 'ERP',
    source: 'n8n',
    favorite: false,
    archived: false,
    aiAnalysis: null,
    nextFollowUp: null,
    emailSubject: 'Subject',
    emailBody: 'Body',
    lastContact: null,
    lastEditedTime: null,
    ...overrides,
  }) as Lead

describe('merge-leads - isMergeFieldEmpty', () => {
  it('returns true for null', () => {
    expect(isMergeFieldEmpty(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(isMergeFieldEmpty(undefined)).toBe(true)
  })

  it('returns true for empty string', () => {
    expect(isMergeFieldEmpty('')).toBe(true)
    expect(isMergeFieldEmpty('   ')).toBe(true)
  })

  it('returns true for empty array', () => {
    expect(isMergeFieldEmpty([])).toBe(true)
  })

  it('returns false for non-empty string', () => {
    expect(isMergeFieldEmpty('test')).toBe(false)
  })

  it('returns false for non-empty array', () => {
    expect(isMergeFieldEmpty(['a'])).toBe(false)
  })

  it('returns false for number', () => {
    expect(isMergeFieldEmpty(0)).toBe(false)
    expect(isMergeFieldEmpty(5)).toBe(false)
  })
})

describe('merge-leads - formatMergeFieldValue', () => {
  it('returns — for null', () => {
    expect(formatMergeFieldValue(null)).toBe('—')
  })

  it('returns — for empty string', () => {
    expect(formatMergeFieldValue('')).toBe('—')
  })

  it('returns trimmed string', () => {
    expect(formatMergeFieldValue('  test  ')).toBe('test')
  })

  it('returns string for number', () => {
    expect(formatMergeFieldValue(42)).toBe('42')
  })

  it('joins array with commas', () => {
    expect(formatMergeFieldValue(['a', 'b'])).toBe('a, b')
  })

  it('returns — for empty array', () => {
    expect(formatMergeFieldValue([])).toBe('—')
  })
})

describe('merge-leads - buildEmptyFieldMerge', () => {
  it('fills empty fields in keeper from archive', () => {
    const keeper = createMockLead({
      email: null,
      phone: null,
      website: null,
      manager: null,
      notes: '',
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      manager: 'Jane Smith',
      notes: 'Archive notes',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(result.patch.email).toBe('archive@test.com')
    expect(result.patch.phone).toBe('+34 600 222 333')
    expect(result.patch.website).toBe('https://archive.com')
    expect(result.patch.manager).toBe('Jane Smith')
    expect(result.patch.notes).toBe('Archive notes')
    expect(result.filledKeys).toContain('email')
    expect(result.filledKeys).toContain('phone')
    expect(result.filledKeys).toContain('website')
    expect(result.filledKeys).toContain('manager')
    expect(result.filledKeys).toContain('notes')
  })

  it('does not overwrite non-empty fields in keeper', () => {
    const keeper = createMockLead({
      email: 'keeper@test.com',
      phone: '+34 600 111 222',
      website: 'https://keeper.com',
      manager: 'John Keeper',
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      manager: 'Jane Smith',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(result.patch.email).toBeUndefined()
    expect(result.patch.phone).toBeUndefined()
    expect(result.patch.website).toBeUndefined()
    expect(result.patch.manager).toBeUndefined()
  })

  it('treats empty string as empty', () => {
    const keeper = createMockLead({
      email: '',
      phone: '',
      website: '',
      notes: '',
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      notes: 'Archive notes',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(result.patch.email).toBe('archive@test.com')
    expect(result.patch.phone).toBe('+34 600 222 333')
    expect(result.patch.website).toBe('https://archive.com')
    expect(result.patch.notes).toBe('Archive notes')
  })

  it('handles undefined values as empty', () => {
    const keeper = createMockLead({
      email: undefined,
      phone: undefined,
      website: undefined,
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(result.patch.email).toBe('archive@test.com')
    expect(result.patch.phone).toBe('+34 600 222 333')
    expect(result.patch.website).toBe('https://archive.com')
  })

  it('merges multiple fields at once', () => {
    const keeper = createMockLead({
      email: null,
      phone: null,
      website: null,
      linkedin: null,
      address: null,
      postalCode: null,
      city: null,
      province: null,
      employees: null,
      manager: null,
      role: null,
      software: null,
      notes: '',
      emailCommercial: null,
      emailManager: null,
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      linkedin: 'https://linkedin.com/company/archive',
      address: 'Calle Archive 456',
      postalCode: '46002',
      city: 'Castellón',
      cityCanonical: 'Castellón',
      province: 'Castellón',
      employees: 25,
      manager: 'Jane Smith',
      role: 'CTO',
      software: 'CRM',
      notes: 'Archive notes',
      emailCommercial: 'comercial@archive.com',
      emailManager: 'gerente@archive.com',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    const expectedFields = [
      'email', 'phone', 'website', 'linkedin', 'address', 'postalCode',
      'city', 'province', 'employees', 'manager', 'role',
      'software', 'notes', 'emailCommercial', 'emailManager',
    ]

    for (const field of expectedFields) {
      expect(result.patch).toHaveProperty(field)
      expect(result.patch[field as keyof typeof result.patch]).toBeDefined()
    }
  })

  it('returns empty patch when keeper has all fields', () => {
    const keeper = createMockLead({
      email: 'keeper@test.com',
      phone: '+34 600 111 222',
      website: 'https://keeper.com',
      linkedin: 'https://linkedin.com/company/keeper',
      address: 'Calle Keeper 123',
      postalCode: '46001',
      city: 'Valencia',
      cityCanonical: 'Valencia',
      province: 'Valencia',
      employees: 10,
      manager: 'John Keeper',
      role: 'CEO',
      software: 'ERP',
      notes: 'Keeper notes',
      emailCommercial: 'comercial@keeper.com',
      emailManager: 'gerente@keeper.com',
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
    })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(Object.keys(result.patch)).toHaveLength(0)
    expect(result.filledKeys).toHaveLength(0)
  })

  it('preview includes all mergeable fields', () => {
    const keeper = createMockLead({ email: null, phone: '+34 600 111 222' })
    const archive = createMockLead({ email: 'archive@test.com', phone: '+34 600 222 333' })

    const result = buildEmptyFieldMerge(keeper, archive)

    expect(result.preview).toHaveLength(MERGEABLE_FIELD_KEYS.length)
    const emailPreview = result.preview.find((p) => p.key === 'email')
    expect(emailPreview?.willFill).toBe(true)
    expect(emailPreview?.keepValue).toBe('—')
    expect(emailPreview?.archiveValue).toBe('archive@test.com')

    const phonePreview = result.preview.find((p) => p.key === 'phone')
    expect(phonePreview?.willFill).toBe(false)
  })
})

describe('merge-leads - computeMergePreview', () => {
  it('returns preview of fields that would be filled', () => {
    const keeper = createMockLead({
      email: null,
      phone: '+34 600 111 222',
      website: null,
      manager: null,
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      manager: 'Jane Smith',
    })

    const preview = computeMergePreview(keeper, archive)

    expect(preview.filledKeys).toContain('email')
    expect(preview.filledKeys).toContain('website')
    expect(preview.filledKeys).toContain('manager')
    expect(preview.filledKeys).not.toContain('phone')
    expect(preview.preview.find((p) => p.key === 'email')?.willFill).toBe(true)
    expect(preview.preview.find((p) => p.key === 'phone')?.willFill).toBe(false)
  })

  it('returns empty willFill when keeper has all fields', () => {
    const keeper = createMockLead({
      email: 'keeper@test.com',
      phone: '+34 600 111 222',
      website: 'https://keeper.com',
      manager: 'John Keeper',
    })

    const archive = createMockLead({
      email: 'archive@test.com',
      phone: '+34 600 222 333',
      website: 'https://archive.com',
      manager: 'Jane Smith',
    })

    const preview = computeMergePreview(keeper, archive)

    expect(preview.filledKeys).toHaveLength(0)
    expect(preview.preview.every((p) => !p.willFill)).toBe(true)
  })
})