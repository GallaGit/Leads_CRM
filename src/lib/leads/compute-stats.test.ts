import { describe, it, expect } from 'vitest'
import { computeLeadStats, EMPLOYEE_BUCKETS } from '@/lib/leads/compute-stats'
import type { Lead, LeadStatus } from '@/lib/domain/lead'

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
  score: 0,
  manager: null,
  role: null,
  confidence: null,
  software: null,
  source: 'n8n',
  favorite: false,
  archived: false,
  aiAnalysis: null,
  nextFollowUp: null,
  ...overrides,
})

describe('compute-stats - EMPLOYEE_BUCKETS', () => {
  it('has 6 buckets', () => {
    expect(EMPLOYEE_BUCKETS).toHaveLength(6)
  })

  it('buckets have correct keys', () => {
    const keys = EMPLOYEE_BUCKETS.map((b) => b.key)
    expect(keys).toEqual(['unknown', '1-4', '5-30', '31-50', '51+', '0'])
  })

  it('buckets match correctly', () => {
    expect(EMPLOYEE_BUCKETS[0].match(null)).toBe(true)
    expect(EMPLOYEE_BUCKETS[0].match(5)).toBe(false)

    expect(EMPLOYEE_BUCKETS[1].match(1)).toBe(true)
    expect(EMPLOYEE_BUCKETS[1].match(4)).toBe(true)
    expect(EMPLOYEE_BUCKETS[1].match(5)).toBe(false)

    expect(EMPLOYEE_BUCKETS[2].match(5)).toBe(true)
    expect(EMPLOYEE_BUCKETS[2].match(30)).toBe(true)
    expect(EMPLOYEE_BUCKETS[2].match(31)).toBe(false)

    expect(EMPLOYEE_BUCKETS[3].match(31)).toBe(true)
    expect(EMPLOYEE_BUCKETS[3].match(50)).toBe(true)
    expect(EMPLOYEE_BUCKETS[3].match(51)).toBe(false)

    expect(EMPLOYEE_BUCKETS[4].match(51)).toBe(true)
    expect(EMPLOYEE_BUCKETS[4].match(100)).toBe(true)

    expect(EMPLOYEE_BUCKETS[5].match(0)).toBe(true)
    expect(EMPLOYEE_BUCKETS[5].match(1)).toBe(false)
  })
})

describe('compute-stats - computeLeadStats Integration', () => {
  it('returns zeros for empty leads', () => {
    const stats = computeLeadStats([])

    expect(stats.total).toBe(0)
    expect(stats.byStatus.every((r) => r.count === 0)).toBe(true)
    expect(stats.byProvince.every((r) => r.count === 0)).toBe(true)
    expect(stats.byCity.every((r) => r.count === 0)).toBe(true)
    expect(stats.byEmployees.every((r) => r.count === 0)).toBe(true)
    expect(stats.rates.every((r) => r.count === 0 && r.percent === 0)).toBe(true)
  })

  it('counts byStatus correctly for 9 states', () => {
    const statuses: LeadStatus[] = [
      'Nuevo', 'Pendiente revisar', 'Validado', 'Email preparado',
      'Email enviado', 'Respondió', 'Reunión', 'Cliente', 'Descartado'
    ]

    const leads = statuses.map((status, i) =>
      createMockLead({ id: `lead-${i}`, status })
    )

    const stats = computeLeadStats(leads)

    expect(stats.total).toBe(9)
    expect(stats.byStatus).toHaveLength(9)
    stats.byStatus.forEach((row) => {
      expect(row.count).toBe(1)
      expect(row.percent).toBeCloseTo(11.1, 1)
    })
  })

  it('byProvince orders by PROVINCES then count', () => {
    const leads = [
      createMockLead({ id: '1', province: 'Castellón' }),
      createMockLead({ id: '2', province: 'Valencia' }),
      createMockLead({ id: '3', province: 'Valencia' }),
      createMockLead({ id: '4', province: 'Alicante' }),
      createMockLead({ id: '5', province: '' }), // Sin provincia
    ]

    const stats = computeLeadStats(leads)

    // Ordered by PROVINCES: Valencia, Alicante, Castellón, then Sin provincia
    expect(stats.byProvince[0].key).toBe('Valencia')
    expect(stats.byProvince[0].count).toBe(2)
    expect(stats.byProvince[1].key).toBe('Alicante')
    expect(stats.byProvince[2].key).toBe('Castellón')
    expect(stats.byProvince[3].key).toBe('Sin provincia')
  })

  it('byCity sorts by count desc, top 20', () => {
    const leads = [
      createMockLead({ id: '1', city: 'Valencia', cityCanonical: 'Valencia' }),
      createMockLead({ id: '2', city: 'Valencia', cityCanonical: 'Valencia' }),
      createMockLead({ id: '3', city: 'Valencia', cityCanonical: 'Valencia' }),
      createMockLead({ id: '4', city: 'Castellón', cityCanonical: 'Castellón' }),
      createMockLead({ id: '5', city: 'Sagunto', cityCanonical: 'Sagunto' }),
      createMockLead({ id: '6', city: '', cityCanonical: '' }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.byCity[0].key).toBe('Valencia')
    expect(stats.byCity[0].count).toBe(3)
    expect(stats.byCity[1].key).toBe('Castellón')
    expect(stats.byCity[2].key).toBe('Sagunto')
    expect(stats.byCity[3].key).toBe('Sin ciudad')
  })

  it('byEmployees distributes across 6 buckets', () => {
    const leads = [
      createMockLead({ id: '1', employees: null }),
      createMockLead({ id: '2', employees: 2 }),
      createMockLead({ id: '3', employees: 10 }),
      createMockLead({ id: '4', employees: 40 }),
      createMockLead({ id: '5', employees: 100 }),
      createMockLead({ id: '6', employees: 0 }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.byEmployees).toHaveLength(6)
    const counts = stats.byEmployees.map((r) => r.count)
    expect(counts).toEqual([1, 1, 1, 1, 1, 1])
  })

  it('funnel equals byStatus', () => {
    const leads = [
      createMockLead({ id: '1', status: 'Nuevo' }),
      createMockLead({ id: '2', status: 'Validado' }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.funnel).toEqual(stats.byStatus)
  })

  it('rates calculates funnel rates excluding Descartado', () => {
    const leads = [
      createMockLead({ id: '1', status: 'Nuevo' }),
      createMockLead({ id: '2', status: 'Validado' }),
      createMockLead({ id: '3', status: 'Email preparado' }),
      createMockLead({ id: '4', status: 'Respondió' }),
      createMockLead({ id: '5', status: 'Reunión' }),
      createMockLead({ id: '6', status: 'Cliente' }),
      createMockLead({ id: '7', status: 'Descartado' }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.rates).toHaveLength(5)

    const validationRate = stats.rates.find((r) => r.key === 'validation')
    expect(validationRate?.count).toBe(5) // Validado or later (excludes Nuevo + Descartado)
    expect(validationRate?.percent).toBeCloseTo(71.4, 1)

    const clientRate = stats.rates.find((r) => r.key === 'client')
    expect(clientRate?.count).toBe(1)
    expect(clientRate?.percent).toBeCloseTo(14.3, 1)
  })

  it('handles leads with only Descartado', () => {
    const leads = [
      createMockLead({ id: '1', status: 'Descartado' }),
      createMockLead({ id: '2', status: 'Descartado' }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.total).toBe(2)
    expect(stats.rates.every((r) => r.count === 0)).toBe(true)
  })

  it('uses cityCanonical over city for byCity', () => {
    const leads = [
      createMockLead({ id: '1', city: 'València', cityCanonical: 'Valencia' }),
      createMockLead({ id: '2', city: 'Valencia', cityCanonical: 'Valencia' }),
    ]

    const stats = computeLeadStats(leads)

    expect(stats.byCity).toHaveLength(1)
    expect(stats.byCity[0].key).toBe('Valencia')
    expect(stats.byCity[0].count).toBe(2)
  })
})