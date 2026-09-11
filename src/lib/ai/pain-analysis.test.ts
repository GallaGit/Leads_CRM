import { describe, it, expect } from 'vitest'
import {
  parsePainAnalysis,
  formatPainAnalysis,
  normalizePainAnalysis,
  hasStructuredPainAnalysis,
  fromApiPainAnalysis,
  resolvePainAnalysis,
  hasPainAnalysisSignal,
  buildLeadFacts,
  PAIN_SECTION_LABELS,
  EMPTY_PAIN_ANALYSIS,
  type PainAnalysis,
} from '@/lib/ai/pain-analysis'
import type { Lead } from '@/lib/domain/lead'

describe('pain-analysis - parsePainAnalysis', () => {
  it('parses Spanish headings with bullets', () => {
    const text = `Evidencia
• Item 1
• Item 2

Inferencia
• Item 3

Especulación
• Item 4`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1', 'Item 2'])
    expect(result.inference).toEqual(['Item 3'])
    expect(result.speculation).toEqual(['Item 4'])
  })

  it('parses English headings with bullets', () => {
    const text = `Evidence
• Item 1

Inference
• Item 2

Speculation
• Item 3`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1'])
    expect(result.inference).toEqual(['Item 2'])
    expect(result.speculation).toEqual(['Item 3'])
  })

  it('parses markdown headings (# ## ###)', () => {
    const text = `## Evidencia
• Item 1

### Inferencia
• Item 2

# Especulación
• Item 3`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1'])
    expect(result.inference).toEqual(['Item 2'])
    expect(result.speculation).toEqual(['Item 3'])
  })

  it('parses bold headings', () => {
    const text = `**Evidencia**
• Item 1

**Inferencia**
• Item 2`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1'])
    expect(result.inference).toEqual(['Item 2'])
  })

  it('parses JSON format', () => {
    const json = JSON.stringify({
      evidencia: ['Evidencia 1', 'Evidencia 2'],
      inferencia: ['Inferencia 1'],
      especulacion: ['Especulación 1'],
    })

    const result = parsePainAnalysis(json)

    expect(result.evidence).toEqual(['Evidencia 1', 'Evidencia 2'])
    expect(result.inference).toEqual(['Inferencia 1'])
    expect(result.speculation).toEqual(['Especulación 1'])
  })

  it('parses JSON with English keys', () => {
    const json = JSON.stringify({
      evidence: ['Evidence 1'],
      inference: ['Inference 1'],
      speculation: ['Speculation 1'],
    })

    const result = parsePainAnalysis(json)

    expect(result.evidence).toEqual(['Evidence 1'])
    expect(result.inference).toEqual(['Inference 1'])
    expect(result.speculation).toEqual(['Speculation 1'])
  })

  it('parses JSON in markdown code fence', () => {
    const text = `\`\`\`json
{
  "evidencia": ["Item 1"],
  "inferencia": ["Item 2"]
}
\`\`\``

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1'])
    expect(result.inference).toEqual(['Item 2'])
  })

  it('returns empty for empty/null/undefined', () => {
    expect(parsePainAnalysis('')).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(parsePainAnalysis(null)).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(parsePainAnalysis(undefined)).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(parsePainAnalysis('   ')).toEqual(EMPTY_PAIN_ANALYSIS)
  })

  it('handles mixed bullet styles', () => {
    const text = `Evidencia
- Item 1
* Item 2
• Item 3`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1', 'Item 2', 'Item 3'])
  })

  it('deduplicates items case-insensitively', () => {
    const text = `Evidencia
• Item 1
• item 1
• ITEM 1`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1'])
  })

  it('ignores empty bullets', () => {
    const text = `Evidencia
• Item 1
• 
• Item 2`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['Item 1', 'Item 2'])
  })

  it('prioritizes JSON over headings when both present', () => {
    const text = `Evidencia
• Heading Item

{"evidencia":["JSON Item"]}`

    const result = parsePainAnalysis(text)

    expect(result.evidence).toEqual(['JSON Item'])
  })
})

describe('pain-analysis - formatPainAnalysis', () => {
  it('formats three sections with bullets', () => {
    const analysis: PainAnalysis = {
      evidence: ['Evidencia 1', 'Evidencia 2'],
      inference: ['Inferencia 1'],
      speculation: ['Especulación 1'],
    }

    const result = formatPainAnalysis(analysis)

    expect(result).toContain('Evidencia')
    expect(result).toContain('• Evidencia 1')
    expect(result).toContain('• Evidencia 2')
    expect(result).toContain('Inferencia')
    expect(result).toContain('• Inferencia 1')
    expect(result).toContain('Especulación')
    expect(result).toContain('• Especulación 1')
  })

  it('shows • — for empty sections', () => {
    const analysis: PainAnalysis = {
      evidence: [],
      inference: [],
      speculation: [],
    }

    const result = formatPainAnalysis(analysis)

    expect(result).toContain('• —')
    expect(result.split('• —').length).toBe(4) // 3 sections + 1
  })

  it('truncates at 2000 characters', () => {
    const longItem = 'x'.repeat(1000)
    const analysis: PainAnalysis = {
      evidence: [longItem, longItem],
      inference: [longItem],
      speculation: [longItem],
    }

    const result = formatPainAnalysis(analysis)

    expect(result.length).toBeLessThanOrEqual(2000)
    expect(result.endsWith('…')).toBe(true)
  })

  it('does not truncate when under limit', () => {
    const analysis: PainAnalysis = {
      evidence: ['Short item'],
      inference: ['Short item'],
      speculation: ['Short item'],
    }

    const result = formatPainAnalysis(analysis)

    expect(result.length).toBeLessThan(2000)
    expect(result.endsWith('…')).toBe(false)
  })
})

describe('pain-analysis - normalizePainAnalysis', () => {
  it('cleans and deduplicates arrays', () => {
    const input = {
      evidence: ['  Item 1  ', 'item 1', 'Item 2', '—', ''],
      inference: ['Inference 1', 'inference 1'],
      speculation: ['Speculation 1'],
    }

    const result = normalizePainAnalysis(input)

    expect(result.evidence).toEqual(['Item 1', 'Item 2'])
    expect(result.inference).toEqual(['Inference 1'])
    expect(result.speculation).toEqual(['Speculation 1'])
  })

  it('handles null/undefined/partial input', () => {
    expect(normalizePainAnalysis(null)).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(normalizePainAnalysis(undefined)).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(normalizePainAnalysis({})).toEqual(EMPTY_PAIN_ANALYSIS)
    expect(normalizePainAnalysis({ evidence: ['test'] })).toEqual({
      evidence: ['test'],
      inference: [],
      speculation: [],
    })
  })

  it('converts string to array by newlines', () => {
    const result = normalizePainAnalysis({
      evidence: 'Item 1\nItem 2\nItem 3',
    })

    expect(result.evidence).toEqual(['Item 1', 'Item 2', 'Item 3'])
  })
})

describe('pain-analysis - hasStructuredPainAnalysis', () => {
  it('returns true for structured text with content', () => {
    const text = `Evidencia
• Item 1

Inferencia
• Item 2`

    expect(hasStructuredPainAnalysis(text)).toBe(true)
  })

  it('returns true for JSON with content', () => {
    const json = JSON.stringify({ evidencia: ['Item'] })
    expect(hasStructuredPainAnalysis(json)).toBe(true)
  })

  it('returns false for empty', () => {
    expect(hasStructuredPainAnalysis('')).toBe(false)
    expect(hasStructuredPainAnalysis(null)).toBe(false)
    expect(hasStructuredPainAnalysis(undefined)).toBe(false)
  })

  it('returns false for text without sections', () => {
    expect(hasStructuredPainAnalysis('Just some text')).toBe(false)
  })
})

describe('pain-analysis - fromApiPainAnalysis', () => {
  it('maps Spanish keys', () => {
    const api = {
      evidencia: ['E1'],
      inferencia: ['I1'],
      especulacion: ['S1'],
    }

    const result = fromApiPainAnalysis(api)

    expect(result?.evidence).toEqual(['E1'])
    expect(result?.inference).toEqual(['I1'])
    expect(result?.speculation).toEqual(['S1'])
  })

  it('maps English keys', () => {
    const api = {
      evidence: ['E1'],
      inference: ['I1'],
      speculation: ['S1'],
    }

    const result = fromApiPainAnalysis(api)

    expect(result?.evidence).toEqual(['E1'])
  })

  it('maps capitalized keys', () => {
    const api = {
      Evidencia: ['E1'],
      Inferencia: ['I1'],
      Especulación: ['S1'],
    }

    const result = fromApiPainAnalysis(api)

    expect(result?.evidence).toEqual(['E1'])
  })

  it('returns null for empty/invalid input', () => {
    expect(fromApiPainAnalysis(null)).toBeNull()
    expect(fromApiPainAnalysis({})).toBeNull()
    expect(fromApiPainAnalysis({ evidencia: [] })).toBeNull()
  })
})

describe('pain-analysis - resolvePainAnalysis', () => {
  it('prioritizes API analysis over stored', () => {
    const api = { evidencia: ['API Item'] }
    const stored = 'Evidencia\n• Stored Item'

    const result = resolvePainAnalysis(api, stored)

    expect(result?.evidence).toEqual(['API Item'])
  })

  it('falls back to stored when API empty', () => {
    const api = {}
    const stored = 'Evidencia\n• Stored Item'

    const result = resolvePainAnalysis(api, stored)

    expect(result?.evidence).toEqual(['Stored Item'])
  })

  it('returns null when both empty', () => {
    expect(resolvePainAnalysis({}, '')).toBeNull()
    expect(resolvePainAnalysis(null, null)).toBeNull()
  })
})

describe('pain-analysis - hasPainAnalysisSignal', () => {
  it('returns true when website present', () => {
    const lead = createMockLead({ website: 'https://test.com' })
    expect(hasPainAnalysisSignal(lead)).toBe(true)
  })

  it('returns true when notes present', () => {
    const lead = createMockLead({ notes: 'Some notes' })
    expect(hasPainAnalysisSignal(lead)).toBe(true)
  })

  it('returns true when notesOverflow present', () => {
    const lead = createMockLead({ notesOverflow: 'Overflow notes' })
    expect(hasPainAnalysisSignal(lead)).toBe(true)
  })

  it('returns true when software present', () => {
    const lead = createMockLead({ software: 'ERP' })
    expect(hasPainAnalysisSignal(lead)).toBe(true)
  })

  it('returns true when services present', () => {
    const lead = createMockLead({ services: ['Asesoría'] })
    expect(hasPainAnalysisSignal(lead)).toBe(true)
  })

  it('returns false for empty lead', () => {
    const lead = createMockLead({
      website: null,
      notes: '',
      notesOverflow: null,
      software: null,
      services: [],
    })
    expect(hasPainAnalysisSignal(lead)).toBe(false)
  })
})

describe('pain-analysis - buildLeadFacts', () => {
  it('includes all non-empty fields', () => {
    const lead = createMockLead({
      companyName: 'Test Company',
      website: 'https://test.com',
      cityCanonical: 'Valencia',
      province: 'Valencia',
      employees: 10,
      services: ['Asesoría', 'Gestoría'],
      software: 'ERP',
      status: 'Validado',
      manager: 'John Doe',
      role: 'CEO',
      confidence: 'Alta',
      source: 'n8n',
      score: 75,
      email: 'test@test.com',
      phone: '+34 600 111 222',
      linkedin: 'https://linkedin.com/company/test',
      address: 'Calle Test 123',
      notes: 'Some notes',
      notesOverflow: 'More notes',
    })

    const facts = buildLeadFacts(lead)

    expect(facts).toContain('Empresa: Test Company')
    expect(facts).toContain('Web: https://test.com')
    expect(facts).toContain('Ciudad: Valencia')
    expect(facts).toContain('Provincia: Valencia')
    expect(facts).toContain('Empleados: 10')
    expect(facts).toContain('Servicios: Asesoría, Gestoría')
    expect(facts).toContain('Software: ERP')
    expect(facts).toContain('Estado CRM: Validado')
    expect(facts).toContain('Gerente: John Doe')
    expect(facts).toContain('Cargo: CEO')
    expect(facts).toContain('Confianza extracción: Alta')
    expect(facts).toContain('Origen: n8n')
    expect(facts).toContain('Score: 75')
    expect(facts).toContain('Email general: test@test.com')
    expect(facts).toContain('Teléfono: +34 600 111 222')
    expect(facts).toContain('LinkedIn: https://linkedin.com/company/test')
    expect(facts).toContain('Dirección: Calle Test 123')
    expect(facts).toContain('Notas: Some notes')
    expect(facts).toContain('Notas (continuación): More notes')
  })

  it('omits null/empty fields', () => {
    const lead = createMockLead({
      website: null,
      cityCanonical: null,
      province: null,
      employees: null,
      services: [],
      software: null,
      manager: null,
      role: null,
      confidence: null,
      source: null,
      score: 0,
      email: null,
      phone: null,
      linkedin: null,
      address: null,
      notes: '',
      notesOverflow: null,
    })

    const facts = buildLeadFacts(lead)

    expect(facts).toContain('Empresa: Test Company')
    expect(facts).not.toContain('Web:')
    expect(facts).not.toContain('Ciudad:')
    expect(facts).not.toContain('Provincia:')
    expect(facts).not.toContain('Empleados:')
    expect(facts).not.toContain('Servicios:')
    expect(facts).not.toContain('Software:')
  })

  it('returns fallback message for completely empty lead', () => {
    const lead = createMockLead({
      companyName: '',
      website: null,
      cityCanonical: null,
      province: null,
      employees: null,
      services: [],
      software: null,
      status: 'Nuevo',
      manager: null,
      role: null,
      confidence: null,
      source: null,
      score: 0,
      email: null,
      phone: null,
      linkedin: null,
      address: null,
      notes: '',
      notesOverflow: null,
    })

    const facts = buildLeadFacts(lead)

    expect(facts).toBe('No hay campos con datos en este lead.')
  })
})

describe('pain-analysis - Constants', () => {
  it('PAIN_SECTION_LABELS has correct Spanish labels', () => {
    expect(PAIN_SECTION_LABELS.evidence).toBe('Evidencia')
    expect(PAIN_SECTION_LABELS.inference).toBe('Inferencia')
    expect(PAIN_SECTION_LABELS.speculation).toBe('Especulación')
  })

  it('EMPTY_PAIN_ANALYSIS has empty arrays', () => {
    expect(EMPTY_PAIN_ANALYSIS.evidence).toEqual([])
    expect(EMPTY_PAIN_ANALYSIS.inference).toEqual([])
    expect(EMPTY_PAIN_ANALYSIS.speculation).toEqual([])
  })
})

function createMockLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: `lead-${Math.random().toString(36).slice(2)}`,
    companyName: 'Test Company',
    website: null,
    phone: null,
    address: null,
    postalCode: null,
    city: null,
    cityCanonical: null,
    province: null,
    employees: null,
    linkedin: null,
    services: [],
    status: 'Nuevo' as const,
    lastActivity: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    notes: '',
    notesOverflow: null,
    email: null,
    emailCommercial: null,
    emailManager: null,
    score: 0,
    manager: null,
    role: null,
    confidence: null,
    software: null,
    source: null,
    favorite: false,
    archived: false,
    aiAnalysis: null,
    nextFollowUp: null,
    ...overrides,
  }
}