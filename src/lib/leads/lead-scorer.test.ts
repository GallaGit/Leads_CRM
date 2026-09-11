import { describe, it, expect } from 'vitest'
import {
  scoreLead,
  scorers,
  SCORE_WEIGHTS,
  scoreWeightsTotal,
  type LeadScoreResult,
} from '@/lib/leads/lead-scorer'
import type { Lead, LeadStatus } from '@/lib/domain/lead'

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
    status: 'Nuevo' as LeadStatus,
    lastActivity: new Date().toISOString(),
    createdAt: null,
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
    emailSubject: null,
    emailBody: null,
    lastContact: null,
    lastEditedTime: null,
    ...overrides,
  }) as Lead

describe('lead-scorer - Weight Constants', () => {
  it('SCORE_WEIGHTS sums to 100', () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })

  it('has 7 scoring factors', () => {
    expect(Object.keys(SCORE_WEIGHTS)).toHaveLength(7)
  })

  it('scoreWeightsTotal returns 100', () => {
    expect(scoreWeightsTotal()).toBe(100)
  })

  it('weights match expected values', () => {
    expect(SCORE_WEIGHTS.hasEmail).toBe(20)
    expect(SCORE_WEIGHTS.hasPhone).toBe(15)
    expect(SCORE_WEIGHTS.hasWeb).toBe(10)
    expect(SCORE_WEIGHTS.hasLinkedIn).toBe(10)
    expect(SCORE_WEIGHTS.employeeRangeFit).toBe(20)
    expect(SCORE_WEIGHTS.cityKnown).toBe(10)
    expect(SCORE_WEIGHTS.statusProgress).toBe(15)
  })
})

describe('lead-scorer - Individual Scorers', () => {
  describe('hasEmail', () => {
    it('returns 20 when email present', () => {
      const lead = createMockLead({ email: 'test@test.com' })
      expect(scorers.hasEmail(lead)).toBe(20)
    })

    it('returns 20 when emailCommercial present', () => {
      const lead = createMockLead({ email: null, emailCommercial: 'comercial@test.com' })
      expect(scorers.hasEmail(lead)).toBe(20)
    })

    it('returns 20 when emailManager present', () => {
      const lead = createMockLead({ email: null, emailCommercial: null, emailManager: 'gerente@test.com' })
      expect(scorers.hasEmail(lead)).toBe(20)
    })

    it('returns 0 when no emails', () => {
      const lead = createMockLead({ email: null, emailCommercial: null, emailManager: null })
      expect(scorers.hasEmail(lead)).toBe(0)
    })

    it('returns 0 for empty string emails', () => {
      const lead = createMockLead({ email: '', emailCommercial: '', emailManager: '' })
      expect(scorers.hasEmail(lead)).toBe(0)
    })
  })

  describe('hasPhone', () => {
    it('returns 15 when phone present', () => {
      const lead = createMockLead({ phone: '+34 600 111 222' })
      expect(scorers.hasPhone(lead)).toBe(15)
    })

    it('returns 0 when phone missing', () => {
      const lead = createMockLead({ phone: null })
      expect(scorers.hasPhone(lead)).toBe(0)
    })

    it('returns 0 for empty string', () => {
      const lead = createMockLead({ phone: '' })
      expect(scorers.hasPhone(lead)).toBe(0)
    })
  })

  describe('hasWeb', () => {
    it('returns 10 when website present', () => {
      const lead = createMockLead({ website: 'https://test.com' })
      expect(scorers.hasWeb(lead)).toBe(10)
    })

    it('returns 0 when website missing', () => {
      const lead = createMockLead({ website: null })
      expect(scorers.hasWeb(lead)).toBe(0)
    })
  })

  describe('hasLinkedIn', () => {
    it('returns 10 when LinkedIn present', () => {
      const lead = createMockLead({ linkedin: 'https://linkedin.com/company/test' })
      expect(scorers.hasLinkedIn(lead)).toBe(10)
    })

    it('returns 0 when LinkedIn missing', () => {
      const lead = createMockLead({ linkedin: null })
      expect(scorers.hasLinkedIn(lead)).toBe(0)
    })
  })

  describe('employeeRangeFit', () => {
    it('returns 20 for ICP range 5-30', () => {
      for (let n = 5; n <= 30; n++) {
        const lead = createMockLead({ employees: n })
        expect(scorers.employeeRangeFit(lead)).toBe(20)
      }
    })

    it('returns 10 for near range 3-4', () => {
      const lead3 = createMockLead({ employees: 3 })
      const lead4 = createMockLead({ employees: 4 })
      expect(scorers.employeeRangeFit(lead3)).toBe(10)
      expect(scorers.employeeRangeFit(lead4)).toBe(10)
    })

    it('returns 10 for near range 31-50', () => {
      for (let n = 31; n <= 50; n++) {
        const lead = createMockLead({ employees: n })
        expect(scorers.employeeRangeFit(lead)).toBe(10)
      }
    })

    it('returns 0 for 0 employees', () => {
      const lead = createMockLead({ employees: 0 })
      expect(scorers.employeeRangeFit(lead)).toBe(0)
    })

    it('returns 0 for 1-2 employees', () => {
      const lead1 = createMockLead({ employees: 1 })
      const lead2 = createMockLead({ employees: 2 })
      expect(scorers.employeeRangeFit(lead1)).toBe(0)
      expect(scorers.employeeRangeFit(lead2)).toBe(0)
    })

    it('returns 0 for >50 employees', () => {
      const lead = createMockLead({ employees: 100 })
      expect(scorers.employeeRangeFit(lead)).toBe(0)
    })

    it('returns 0 for null/undefined/NaN', () => {
      expect(scorers.employeeRangeFit(createMockLead({ employees: null }))).toBe(0)
      expect(scorers.employeeRangeFit(createMockLead({ employees: undefined }))).toBe(0)
      expect(scorers.employeeRangeFit(createMockLead({ employees: NaN }))).toBe(0)
      expect(scorers.employeeRangeFit(createMockLead({ employees: -5 }))).toBe(0)
    })
  })

  describe('cityKnown', () => {
    it('returns 10 for canonical Valencia cities', () => {
      const canonicalCities = [
        'Valencia', 'Castellón', 'Sagunto', 'Mislata', 'Xirivella',
        'Torrent', 'Paterna', 'Manises', 'Burjassot', 'Alboraya',
        'Catarroja', 'Silla', 'Aldaia', 'Paiporta', 'Godella',
        'Moncada', 'Picassent', 'El Puig',
      ]

      for (const city of canonicalCities) {
        const lead = createMockLead({ city, cityCanonical: city })
        expect(scorers.cityKnown(lead)).toBe(10)
      }
    })

    it('returns 0 for non-canonical cities', () => {
      const lead = createMockLead({ city: 'Madrid', cityCanonical: 'Madrid' })
      expect(scorers.cityKnown(lead)).toBe(0)
    })

    it('returns 0 for missing city', () => {
      const lead = createMockLead({ city: null, cityCanonical: null })
      expect(scorers.cityKnown(lead)).toBe(0)
    })

    it('uses cityCanonical over city', () => {
      const lead = createMockLead({ city: 'València', cityCanonical: 'Valencia' })
      expect(scorers.cityKnown(lead)).toBe(10)
    })
  })

  describe('statusProgress', () => {
    const pipeline: LeadStatus[] = [
      'Nuevo',
      'Pendiente revisar',
      'Validado',
      'Email preparado',
      'Email enviado',
      'Respondió',
      'Reunión',
      'Cliente',
    ]

    it('returns 0 for Descartado', () => {
      const lead = createMockLead({ status: 'Descartado' })
      expect(scorers.statusProgress(lead)).toBe(0)
    })

    it('returns 0 for Nuevo (first in pipeline)', () => {
      const lead = createMockLead({ status: 'Nuevo' })
      expect(scorers.statusProgress(lead)).toBe(0)
    })

    it('returns proportional progress for middle stages', () => {
      const maxIdx = pipeline.length - 1
      for (let i = 0; i < pipeline.length; i++) {
        const lead = createMockLead({ status: pipeline[i] })
        const expected = Math.round((i / maxIdx) * 15)
        expect(scorers.statusProgress(lead)).toBe(expected)
      }
    })

    it('returns 15 for Cliente (last in pipeline)', () => {
      const lead = createMockLead({ status: 'Cliente' })
      expect(scorers.statusProgress(lead)).toBe(15)
    })

    it('returns 0 for unknown status', () => {
      const lead = createMockLead({ status: 'Unknown' as LeadStatus })
      expect(scorers.statusProgress(lead)).toBe(0)
    })
  })
})

describe('lead-scorer - scoreLead Integration', () => {
  it('returns total 0 for minimal lead', () => {
    const lead = createMockLead({
      email: null,
      emailCommercial: null,
      emailManager: null,
      phone: null,
      website: null,
      linkedin: null,
      employees: 0,
      city: 'Madrid',
      cityCanonical: 'Madrid',
      status: 'Nuevo',
    })

    const result = scoreLead(lead)

    expect(result.total).toBe(0)
    expect(result.breakdown.hasEmail).toBe(0)
    expect(result.breakdown.hasPhone).toBe(0)
    expect(result.breakdown.hasWeb).toBe(0)
    expect(result.breakdown.hasLinkedIn).toBe(0)
    expect(result.breakdown.employeeRangeFit).toBe(0)
    expect(result.breakdown.cityKnown).toBe(0)
    expect(result.breakdown.statusProgress).toBe(0)
  })

  it('returns total 100 for perfect ICP lead', () => {
    const lead = createMockLead({
      email: 'test@test.com',
      phone: '+34 600 111 222',
      website: 'https://test.com',
      linkedin: 'https://linkedin.com/company/test',
      employees: 15,
      city: 'Valencia',
      cityCanonical: 'Valencia',
      status: 'Cliente',
    })

    const result = scoreLead(lead)

    expect(result.total).toBe(100)
    expect(result.breakdown.hasEmail).toBe(20)
    expect(result.breakdown.hasPhone).toBe(15)
    expect(result.breakdown.hasWeb).toBe(10)
    expect(result.breakdown.hasLinkedIn).toBe(10)
    expect(result.breakdown.employeeRangeFit).toBe(20)
    expect(result.breakdown.cityKnown).toBe(10)
    expect(result.breakdown.statusProgress).toBe(15)
  })

  it('clamps total between 0 and 100', () => {
    const lead = createMockLead({
      email: 'test@test.com',
      phone: '+34 600 111 222',
      website: 'https://test.com',
      linkedin: 'https://linkedin.com/company/test',
      employees: 15,
      city: 'Valencia',
      cityCanonical: 'Valencia',
      status: 'Cliente',
    })

    const result = scoreLead(lead)
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it('breakdown contains all 7 factors', () => {
    const lead = createMockLead()
    const result = scoreLead(lead)

    expect(Object.keys(result.breakdown)).toEqual([
      'hasEmail',
      'hasPhone',
      'hasWeb',
      'hasLinkedIn',
      'employeeRangeFit',
      'cityKnown',
      'statusProgress',
    ])
  })

  it('partial lead scores correctly', () => {
    const lead = createMockLead({
      email: 'test@test.com',
      phone: null,
      website: 'https://test.com',
      linkedin: null,
      employees: 3,
      city: 'Madrid',
      cityCanonical: 'Madrid',
      status: 'Validado',
    })

    const result = scoreLead(lead)

    expect(result.breakdown.hasEmail).toBe(20)
    expect(result.breakdown.hasPhone).toBe(0)
    expect(result.breakdown.hasWeb).toBe(10)
    expect(result.breakdown.hasLinkedIn).toBe(0)
    expect(result.breakdown.employeeRangeFit).toBe(10)
    expect(result.breakdown.cityKnown).toBe(0)
    expect(result.breakdown.statusProgress).toBeGreaterThan(0)
  })

  it('n8n operational range 3-10 gets partial employee score', () => {
    for (let n = 3; n <= 10; n++) {
      const lead = createMockLead({ employees: n })
      const fit = scorers.employeeRangeFit(lead)
      if (n >= 5) {
        expect(fit).toBe(20)
      } else {
        expect(fit).toBe(10)
      }
    }
  })
})

describe('lead-scorer - Type Safety', () => {
  it('LeadScoreResult has correct structure', () => {
    const lead = createMockLead()
    const result: LeadScoreResult = scoreLead(lead)

    expect(typeof result.total).toBe('number')
    expect(typeof result.breakdown).toBe('object')
    expect(result.breakdown.hasEmail).toBeTypeOf('number')
  })
})