import { describe, it, expect } from 'vitest'
import { filterLeads } from '@/lib/leads/filter-leads'
import type { Lead, LeadStatus, LeadFilters } from '@/lib/domain/lead'

const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: `lead-${Math.random().toString(36).slice(2)}`,
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
  status: 'Nuevo' as LeadStatus,
  lastActivity: new Date().toISOString(),
  discoveredAt: new Date().toISOString(),
  notes: '',
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
  ...overrides,
})

const createFilters = (overrides: Partial<LeadFilters> = {}): LeadFilters => ({
  search: '',
  status: [],
  province: [],
  city: [],
  employeesMin: undefined,
  employeesMax: undefined,
  discoveredFrom: undefined,
  discoveredTo: undefined,
  hasEmail: undefined,
  hasPhone: undefined,
  hasWeb: undefined,
  hasLinkedIn: undefined,
  ...overrides,
})

describe('filter-leads - filterLeads', () => {
  it('returns all leads when no filters', () => {
    const leads = [
      createMockLead({ id: '1', companyName: 'Company A' }),
      createMockLead({ id: '2', companyName: 'Company B' }),
    ]

    const result = filterLeads(leads, createFilters())

    expect(result).toHaveLength(2)
  })

  describe('search filter', () => {
    it('filters by company name', () => {
      const leads = [
        createMockLead({ id: '1', companyName: 'Asesoría Valencia' }),
        createMockLead({ id: '2', companyName: 'Gestoría Madrid' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'Valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by website domain', () => {
      const leads = [
        createMockLead({ id: '1', website: 'https://valencia.com' }),
        createMockLead({ id: '2', website: 'https://madrid.com' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by email', () => {
      const leads = [
        createMockLead({ id: '1', email: 'test@valencia.com' }),
        createMockLead({ id: '2', email: 'test@madrid.com' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by city', () => {
      const leads = [
        createMockLead({ id: '1', city: 'Valencia', cityCanonical: 'Valencia' }),
        createMockLead({ id: '2', city: 'Madrid', cityCanonical: 'Madrid' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'Valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by province', () => {
      const leads = [
        createMockLead({ id: '1', province: 'Valencia' }),
        createMockLead({ id: '2', province: 'Madrid' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'Valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by LinkedIn', () => {
      const leads = [
        createMockLead({ id: '1', linkedin: 'https://linkedin.com/company/valencia' }),
        createMockLead({ id: '2', linkedin: 'https://linkedin.com/company/madrid' }),
      ]

      const result = filterLeads(leads, createFilters({ search: 'valencia' }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('is case insensitive', () => {
      const leads = [createMockLead({ id: '1', companyName: 'Asesoría Valencia' })]

      const result = filterLeads(leads, createFilters({ search: 'VALENCIA' }))

      expect(result).toHaveLength(1)
    })
  })

  describe('status filter', () => {
    it('filters by single status', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo' }),
        createMockLead({ id: '2', status: 'Validado' }),
        createMockLead({ id: '3', status: 'Nuevo' }),
      ]

      const result = filterLeads(leads, createFilters({ status: ['Nuevo'] }))

      expect(result).toHaveLength(2)
      expect(result.every((l) => l.status === 'Nuevo')).toBe(true)
    })

    it('filters by multiple statuses (OR)', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo' }),
        createMockLead({ id: '2', status: 'Validado' }),
        createMockLead({ id: '3', status: 'Email preparado' }),
      ]

      const result = filterLeads(leads, createFilters({ status: ['Nuevo', 'Validado'] }))

      expect(result).toHaveLength(2)
      expect(result.map((l) => l.status).sort()).toEqual(['Nuevo', 'Validado'])
    })
  })

  describe('province filter', () => {
    it('filters by single province', () => {
      const leads = [
        createMockLead({ id: '1', province: 'Valencia' }),
        createMockLead({ id: '2', province: 'Castellón' }),
        createMockLead({ id: '3', province: 'Valencia' }),
      ]

      const result = filterLeads(leads, createFilters({ province: ['Valencia'] }))

      expect(result).toHaveLength(2)
      expect(result.every((l) => l.province === 'Valencia')).toBe(true)
    })

    it('filters by multiple provinces (OR)', () => {
      const leads = [
        createMockLead({ id: '1', province: 'Valencia' }),
        createMockLead({ id: '2', province: 'Castellón' }),
        createMockLead({ id: '3', province: 'Alicante' }),
      ]

      const result = filterLeads(leads, createFilters({ province: ['Valencia', 'Castellón'] }))

      expect(result).toHaveLength(2)
    })
  })

  describe('city filter with normalization', () => {
    it('matches canonical city', () => {
      const leads = [
        createMockLead({ id: '1', city: 'Valencia', cityCanonical: 'Valencia' }),
        createMockLead({ id: '2', city: 'Castellón', cityCanonical: 'Castellón' }),
      ]

      const result = filterLeads(leads, createFilters({ city: ['Valencia'] }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('matches alias normalized to canonical', () => {
      const leads = [
        createMockLead({ id: '1', city: 'València', cityCanonical: 'Valencia' }),
        createMockLead({ id: '2', city: 'Castelló', cityCanonical: 'Castellón' }),
      ]

      const result = filterLeads(leads, createFilters({ city: ['Valencia'] }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by multiple cities (OR)', () => {
      const leads = [
        createMockLead({ id: '1', cityCanonical: 'Valencia' }),
        createMockLead({ id: '2', cityCanonical: 'Castellón' }),
        createMockLead({ id: '3', cityCanonical: 'Sagunto' }),
      ]

      const result = filterLeads(leads, createFilters({ city: ['Valencia', 'Castellón'] }))

      expect(result).toHaveLength(2)
    })
  })

  describe('employees range filter', () => {
    it('filters by min employees', () => {
      const leads = [
        createMockLead({ id: '1', employees: 5 }),
        createMockLead({ id: '2', employees: 15 }),
        createMockLead({ id: '3', employees: 50 }),
      ]

      const result = filterLeads(leads, createFilters({ employeesMin: 10 }))

      expect(result).toHaveLength(2)
      expect(result.every((l) => (l.employees ?? 0) >= 10)).toBe(true)
    })

    it('filters by max employees', () => {
      const leads = [
        createMockLead({ id: '1', employees: 5 }),
        createMockLead({ id: '2', employees: 15 }),
        createMockLead({ id: '3', employees: 50 }),
      ]

      const result = filterLeads(leads, createFilters({ employeesMax: 20 }))

      expect(result).toHaveLength(2)
      expect(result.every((l) => (l.employees ?? 0) <= 20)).toBe(true)
    })

    it('filters by range (min and max)', () => {
      const leads = [
        createMockLead({ id: '1', employees: 5 }),
        createMockLead({ id: '2', employees: 15 }),
        createMockLead({ id: '3', employees: 50 }),
      ]

      const result = filterLeads(leads, createFilters({ employeesMin: 10, employeesMax: 30 }))

      expect(result).toHaveLength(1)
      expect(result[0].employees).toBe(15)
    })

    it('handles null employees as 0 for min filter', () => {
      const leads = [
        createMockLead({ id: '1', employees: null }),
        createMockLead({ id: '2', employees: 15 }),
      ]

      const result = filterLeads(leads, createFilters({ employeesMin: 1 }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('date range filter', () => {
    it('filters by discoveredFrom (inclusive)', () => {
      const date = '2024-01-15'
      const leads = [
        createMockLead({ id: '1', discoveredAt: '2024-01-10T10:00:00Z' }),
        createMockLead({ id: '2', discoveredAt: '2024-01-15T10:00:00Z' }),
        createMockLead({ id: '3', discoveredAt: '2024-01-20T10:00:00Z' }),
      ]

      const result = filterLeads(leads, createFilters({ discoveredFrom: date }))

      expect(result).toHaveLength(2)
      expect(result.map((l) => l.id).sort()).toEqual(['2', '3'])
    })

    it('filters by discoveredTo (inclusive)', () => {
      const date = '2024-01-15'
      const leads = [
        createMockLead({ id: '1', discoveredAt: '2024-01-10T10:00:00Z' }),
        createMockLead({ id: '2', discoveredAt: '2024-01-15T10:00:00Z' }),
        createMockLead({ id: '3', discoveredAt: '2024-01-20T10:00:00Z' }),
      ]

      const result = filterLeads(leads, createFilters({ discoveredTo: date }))

      expect(result).toHaveLength(2)
      expect(result.map((l) => l.id).sort()).toEqual(['1', '2'])
    })

    it('filters by date range', () => {
      const leads = [
        createMockLead({ id: '1', discoveredAt: '2024-01-10T10:00:00Z' }),
        createMockLead({ id: '2', discoveredAt: '2024-01-15T10:00:00Z' }),
        createMockLead({ id: '3', discoveredAt: '2024-01-20T10:00:00Z' }),
      ]

      const result = filterLeads(leads, createFilters({
        discoveredFrom: '2024-01-12',
        discoveredTo: '2024-01-18',
      }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('has flags filter', () => {
    it('hasEmail=true filters leads with any email', () => {
      const leads = [
        createMockLead({ id: '1', email: 'test@test.com' }),
        createMockLead({ id: '2', email: null, emailCommercial: 'comercial@test.com' }),
        createMockLead({ id: '3', email: null, emailCommercial: null, emailManager: null }),
      ]

      const result = filterLeads(leads, createFilters({ hasEmail: true }))

      expect(result).toHaveLength(2)
    })

    it('hasEmail=false filters leads without any email', () => {
      const leads = [
        createMockLead({ id: '1', email: 'test@test.com' }),
        createMockLead({ id: '2', email: null, emailCommercial: null, emailManager: null }),
      ]

      const result = filterLeads(leads, createFilters({ hasEmail: false }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('hasPhone filters by phone presence', () => {
      const leads = [
        createMockLead({ id: '1', phone: '+34 600 111 222' }),
        createMockLead({ id: '2', phone: null }),
      ]

      const result = filterLeads(leads, createFilters({ hasPhone: true }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('hasWeb filters by website presence', () => {
      const leads = [
        createMockLead({ id: '1', website: 'https://test.com' }),
        createMockLead({ id: '2', website: null }),
      ]

      const result = filterLeads(leads, createFilters({ hasWeb: true }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('hasLinkedIn filters by LinkedIn presence', () => {
      const leads = [
        createMockLead({ id: '1', linkedin: 'https://linkedin.com/company/test' }),
        createMockLead({ id: '2', linkedin: null }),
      ]

      const result = filterLeads(leads, createFilters({ hasLinkedIn: true }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('combined filters (AND logic)', () => {
    it('applies multiple filters as AND', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo', province: 'Valencia', employees: 15 }),
        createMockLead({ id: '2', status: 'Validado', province: 'Valencia', employees: 15 }),
        createMockLead({ id: '3', status: 'Nuevo', province: 'Castellón', employees: 15 }),
        createMockLead({ id: '4', status: 'Nuevo', province: 'Valencia', employees: 5 }),
      ]

      const result = filterLeads(leads, createFilters({
        status: ['Nuevo'],
        province: ['Valencia'],
        employeesMin: 10,
      }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('search combines with other filters', () => {
      const leads = [
        createMockLead({ id: '1', companyName: 'Asesoría Valencia', status: 'Nuevo', province: 'Valencia' }),
        createMockLead({ id: '2', companyName: 'Gestoría Valencia', status: 'Validado', province: 'Valencia' }),
        createMockLead({ id: '3', companyName: 'Asesoría Madrid', status: 'Nuevo', province: 'Madrid' }),
      ]

      const result = filterLeads(leads, createFilters({
        search: 'Asesoría',
        status: ['Nuevo'],
        province: ['Valencia'],
      }))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty leads', () => {
      const result = filterLeads([], createFilters({ status: ['Nuevo'] }))
      expect(result).toEqual([])
    })

    it('handles undefined filter values as no filter', () => {
      const leads = [createMockLead({ id: '1', status: 'Nuevo' })]

      const result = filterLeads(leads, createFilters({ status: undefined }))

      expect(result).toHaveLength(1)
    })

    it('empty array filter means no filter', () => {
      const leads = [createMockLead({ id: '1', status: 'Nuevo' })]

      const result = filterLeads(leads, createFilters({ status: [] }))

      expect(result).toHaveLength(1)
    })
  })
})