import { describe, it, expect } from 'vitest'
import { validateLeadCreate, validateLeadPatch } from '@/lib/leads/validate-lead'
import type { LeadCreateInput, LeadPatch } from '@/lib/domain/lead'

describe('validate-lead - validateLeadCreate', () => {
  const validInput: LeadCreateInput = {
    companyName: 'Test Company',
    website: 'https://test.com',
    phone: '+34 600 111 222',
    address: 'Calle Test 123',
    postalCode: '46001',
    city: 'Valencia',
    province: 'Valencia',
    employees: 10,
    linkedin: 'https://linkedin.com/company/test',
    services: ['Asesoría'],
    email: 'test@test.com',
    emailCommercial: 'comercial@test.com',
    emailManager: 'gerente@test.com',
    notes: 'Test notes',
  }

  it('passes for valid input', () => {
    const result = validateLeadCreate(validInput)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when companyName is missing', () => {
    const input = { ...validInput, companyName: '' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Empresa es obligatoria')
  })

  it('fails when companyName is whitespace only', () => {
    const input = { ...validInput, companyName: '   ' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Empresa es obligatoria')
  })

  it('fails when email is invalid format', () => {
    const input = { ...validInput, email: 'invalid-email' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Email general tiene formato inválido')
  })

  it('fails when emailCommercial is invalid format', () => {
    const input = { ...validInput, emailCommercial: 'invalid' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Email comercial tiene formato inválido')
  })

  it('fails when emailManager is invalid format', () => {
    const input = { ...validInput, emailManager: 'invalid' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Email gerente tiene formato inválido')
  })

  it('passes when optional emails are empty', () => {
    const input = { ...validInput, emailCommercial: '', emailManager: '' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(true)
  })

  it('fails when phone has non-digits (after cleaning)', () => {
    const input = { ...validInput, phone: 'abc-123' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Teléfono debe contener solo dígitos')
  })

  it('passes when phone is valid Spanish format', () => {
    const validPhones = [
      '+34 600 111 222',
      '600111222',
      '0034 600 111 222',
      '91 123 45 67',
    ]

    for (const phone of validPhones) {
      const input = { ...validInput, phone }
      const result = validateLeadCreate(input)
      expect(result.isValid).toBe(true)
    }
  })

  it('passes when phone is empty', () => {
    const input = { ...validInput, phone: '' }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(true)
  })

  it('fails when employees is negative', () => {
    const input = { ...validInput, employees: -5 }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Empleados debe ser un número positivo')
  })

  it('passes when employees is zero', () => {
    const input = { ...validInput, employees: 0 }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(true)
  })

  it('passes when employees is undefined', () => {
    const input = { ...validInput, employees: undefined }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(true)
  })

  it('collects multiple errors', () => {
    const input = {
      ...validInput,
      companyName: '',
      email: 'invalid',
      phone: 'abc',
      employees: -1,
    }
    const result = validateLeadCreate(input)

    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })
})

describe('validate-lead - validateLeadPatch', () => {
  const validPatch: LeadPatch = {
    companyName: 'Updated Company',
    website: 'https://updated.com',
    phone: '+34 600 222 333',
    email: 'updated@test.com',
    status: 'Validado',
    notes: 'Updated notes',
    favorite: true,
  }

  it('passes for valid patch', () => {
    const result = validateLeadPatch(validPatch)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('passes for partial patch (only status)', () => {
    const result = validateLeadPatch({ status: 'Validado' })
    expect(result.isValid).toBe(true)
  })

  it('passes for empty patch', () => {
    const result = validateLeadPatch({})
    expect(result.isValid).toBe(true)
  })

  it('fails when companyName is empty string', () => {
    const patch = { ...validPatch, companyName: '' }
    const result = validateLeadPatch(patch)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Empresa es obligatoria')
  })

  it('fails when email is invalid format', () => {
    const patch = { ...validPatch, email: 'invalid-email' }
    const result = validateLeadPatch(patch)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Email general tiene formato inválido')
  })

  it('fails when phone has non-digits', () => {
    const patch = { ...validPatch, phone: 'abc-123' }
    const result = validateLeadPatch(patch)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Teléfono debe contener solo dígitos')
  })

  it('fails when employees is negative', () => {
    const patch = { ...validPatch, employees: -5 }
    const result = validateLeadPatch(patch)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Empleados debe ser un número positivo')
  })

  it('validates all email fields if present', () => {
    const patch = {
      email: 'invalid1',
      emailCommercial: 'invalid2',
      emailManager: 'invalid3',
    }
    const result = validateLeadPatch(patch)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Email general tiene formato inválido')
    expect(result.errors).toContain('Email comercial tiene formato inválido')
    expect(result.errors).toContain('Email gerente tiene formato inválido')
  })

  it('accepts valid status values', () => {
    const validStatuses = [
      'Nuevo', 'Pendiente revisar', 'Validado', 'Email preparado',
      'Email enviado', 'Respondió', 'Reunión', 'Cliente', 'Descartado',
    ]

    for (const status of validStatuses) {
      const result = validateLeadPatch({ status: status as any })
      expect(result.isValid).toBe(true)
    }
  })

  it('does not validate status (passes through)', () => {
    const result = validateLeadPatch({ status: 'InvalidStatus' as any })
    expect(result.isValid).toBe(true)
  })
})