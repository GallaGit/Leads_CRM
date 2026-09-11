import { describe, it, expect } from 'vitest'
import { buildWorkQueues, type WorkQueueId } from '@/lib/leads/work-queues'
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

describe('work-queues - buildWorkQueues', () => {
  it('returns 6 queues with correct IDs', () => {
    const leads = [createMockLead({ id: '1' })]
    const queues = buildWorkQueues(leads)

    expect(queues).toHaveLength(6)
    const ids = queues.map((q) => q.id)
    expect(ids).toEqual([
      'pendiente_revisar',
      'faltan_datos',
      'emails_listos',
      'followup_overdue',
      'duplicados',
      'archivados',
    ])
  })

  describe('pendiente_revisar queue', () => {
    it('includes leads with status Nuevo', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo' }),
        createMockLead({ id: '2', status: 'Validado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'pendiente_revisar')

      expect(queue?.count).toBe(1)
      expect(queue?.firstLeadId).toBe('1')
      expect(queue?.leads.map((l) => l.id)).toEqual(['1'])
    })

    it('includes leads with status Pendiente revisar', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Pendiente revisar' }),
        createMockLead({ id: '2', status: 'Validado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'pendiente_revisar')

      expect(queue?.count).toBe(1)
      expect(queue?.firstLeadId).toBe('1')
    })

    it('combines Nuevo and Pendiente revisar', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo' }),
        createMockLead({ id: '2', status: 'Pendiente revisar' }),
        createMockLead({ id: '3', status: 'Validado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'pendiente_revisar')

      expect(queue?.count).toBe(2)
    })
  })

  describe('faltan_datos queue', () => {
    it('includes leads missing email, phone, and web', () => {
      const leads = [
        createMockLead({ id: '1', email: null, phone: null, website: null }),
        createMockLead({ id: '2', email: 'test@test.com', phone: null, website: null }),
        createMockLead({ id: '3', email: null, phone: '+34 600 111 222', website: null }),
        createMockLead({ id: '4', email: null, phone: null, website: 'https://test.com' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'faltan_datos')

      expect(queue?.count).toBe(1)
      expect(queue?.firstLeadId).toBe('1')
    })
  })

  describe('emails_listos queue', () => {
    it('includes leads with status Email preparado', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Email preparado' }),
        createMockLead({ id: '2', status: 'Validado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'emails_listos')

      expect(queue?.count).toBe(1)
      expect(queue?.firstLeadId).toBe('1')
    })

    it('includes leads with email draft in Nuevo', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo', emailBody: 'Draft email', emailSubject: 'Subject' }),
        createMockLead({ id: '2', status: 'Nuevo', emailBody: '', emailSubject: '' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'emails_listos')

      expect(queue?.count).toBe(1)
      expect(queue?.firstLeadId).toBe('1')
    })

    it('includes leads with email draft in Pendiente revisar', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Pendiente revisar', emailBody: 'Draft', emailSubject: 'Subj' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'emails_listos')

      expect(queue?.count).toBe(1)
    })

    it('includes leads with email draft in Validado', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Validado', emailBody: 'Draft', emailSubject: 'Subj' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'emails_listos')

      expect(queue?.count).toBe(1)
    })

    it('excludes leads without email draft in Nuevo/Pendiente/Validado', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo', emailBody: '', emailSubject: '' }),
        createMockLead({ id: '2', status: 'Pendiente revisar', emailBody: '', emailSubject: '' }),
        createMockLead({ id: '3', status: 'Validado', emailBody: '', emailSubject: '' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'emails_listos')

      expect(queue?.count).toBe(0)
    })
  })

  describe('followup_overdue queue', () => {
    it('includes leads with nextFollowUp before today and active status', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const leads = [
        createMockLead({ id: '1', nextFollowUp: yesterday, status: 'Nuevo' }),
        createMockLead({ id: '2', nextFollowUp: yesterday, status: 'Validado' }),
        createMockLead({ id: '3', nextFollowUp: yesterday, status: 'Descartado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'followup_overdue')

      expect(queue?.count).toBe(2)
      expect(queue?.leads.map((l) => l.id).sort()).toEqual(['1', '2'])
    })

    it('excludes leads with nextFollowUp today or future', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      const leads = [
        createMockLead({ id: '1', nextFollowUp: tomorrow, status: 'Nuevo' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'followup_overdue')

      expect(queue?.count).toBe(0)
    })

    it('excludes leads without nextFollowUp', () => {
      const leads = [
        createMockLead({ id: '1', nextFollowUp: null, status: 'Nuevo' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'followup_overdue')

      expect(queue?.count).toBe(0)
    })

    it('excludes Descartado status even if overdue', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const leads = [
        createMockLead({ id: '1', nextFollowUp: yesterday, status: 'Descartado' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'followup_overdue')

      expect(queue?.count).toBe(0)
    })
  })

  describe('duplicados queue', () => {
    it('includes leads that are in duplicate groups', () => {
      const leads = [
        createMockLead({ id: '1', email: 'same@test.com' }),
        createMockLead({ id: '2', email: 'same@test.com' }),
        createMockLead({ id: '3', email: 'unique@test.com' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'duplicados')

      expect(queue?.count).toBe(2)
      expect(queue?.leads.map((l) => l.id).sort()).toEqual(['1', '2'])
    })

    it('excludes unique leads', () => {
      const leads = [
        createMockLead({ id: '1', email: 'unique1@test.com' }),
        createMockLead({ id: '2', email: 'unique2@test.com' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'duplicados')

      expect(queue?.count).toBe(0)
    })
  })

  describe('archivados queue', () => {
    it('includes archived leads', () => {
      const leads = [
        createMockLead({ id: '1', archived: true }),
        createMockLead({ id: '2', archived: false }),
        createMockLead({ id: '3', archived: true }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'archivados')

      expect(queue?.count).toBe(2)
      expect(queue?.leads.map((l) => l.id).sort()).toEqual(['1', '3'])
    })

    it('excludes active leads', () => {
      const leads = [
        createMockLead({ id: '1', archived: false }),
        createMockLead({ id: '2', archived: false }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'archivados')

      expect(queue?.count).toBe(0)
    })
  })

  describe('queue structure', () => {
    it('each queue has id, label, count, firstLeadId, leads', () => {
      const leads = [createMockLead({ id: '1', status: 'Nuevo' })]
      const queues = buildWorkQueues(leads)

      for (const queue of queues) {
        expect(queue).toHaveProperty('id')
        expect(queue).toHaveProperty('label')
        expect(queue).toHaveProperty('count')
        expect(queue).toHaveProperty('firstLeadId')
        expect(queue).toHaveProperty('leads')
        expect(typeof queue.count).toBe('number')
        expect(Array.isArray(queue.leads)).toBe(true)
      }
    })

    it('firstLeadId is first lead in queue or null', () => {
      const leads = [
        createMockLead({ id: '1', status: 'Nuevo' }),
        createMockLead({ id: '2', status: 'Nuevo' }),
      ]

      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'pendiente_revisar')

      expect(queue?.firstLeadId).toBe('1')
    })

    it('firstLeadId is null for empty queue', () => {
      const leads = [createMockLead({ id: '1', status: 'Validado' })]
      const queues = buildWorkQueues(leads)
      const queue = queues.find((q) => q.id === 'pendiente_revisar')

      expect(queue?.firstLeadId).toBeNull()
    })
  })

  describe('WorkQueueId type', () => {
    it('includes all 6 queue IDs', () => {
      const validIds: WorkQueueId[] = [
        'pendiente_revisar',
        'faltan_datos',
        'emails_listos',
        'followup_overdue',
        'duplicados',
        'archivados',
      ]

      for (const id of validIds) {
        expect(typeof id).toBe('string')
      }
    })
  })
})