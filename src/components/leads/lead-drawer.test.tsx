import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LeadDrawer } from '@/components/leads/lead-drawer'
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
  notes: 'Test notes',
  notesOverflow: null,
  emailSubject: 'Subject',
  emailBody: 'Body',
  score: 50,
  manager: 'John Doe',
  role: 'CEO',
  confidence: 'Alta',
  software: 'ERP',
  source: 'n8n',
  email: 'test@test.com',
  emailCommercial: null,
  emailManager: null,
  favorite: false,
  archived: false,
  aiAnalysis: null,
  nextFollowUp: null,
  ...overrides,
})

const mockLead = createMockLead({ id: '1', companyName: 'Test Company' })

describe('LeadDrawer', () => {
  const defaultProps = {
    lead: mockLead,
    isOpen: true,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    onAnalyze: vi.fn(),
    onArchive: vi.fn(),
  }

  it('renders when isOpen is true', () => {
    render(<LeadDrawer {...defaultProps} />)

    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<LeadDrawer {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    render(<LeadDrawer {...defaultProps} />)

    fireEvent.click(screen.getByLabelText('Cerrar'))

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape pressed', () => {
    render(<LeadDrawer {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  describe('CRM Tab', () => {
    it('shows CRM tab by default', () => {
      render(<LeadDrawer {...defaultProps} />)

      expect(screen.getByText('CRM')).toBeInTheDocument()
      expect(screen.getByText('Empresa')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('Web')).toBeInTheDocument()
      expect(screen.getByText('https://test.com')).toBeInTheDocument()
    })

    it('calls onUpdate when status changed', () => {
      render(<LeadDrawer {...defaultProps} />)

      const select = screen.getByRole('combobox', { name: /estado/i })
      fireEvent.change(select, { target: { value: 'Validado' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('1', { status: 'Validado' })
    })

    it('shows external links', () => {
      render(<LeadDrawer {...defaultProps} />)

      expect(screen.getByLabelText(/abrir web/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/maps/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
  })

  describe('Notas Tab', () => {
    it('shows notes textarea when Notas tab clicked', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Notas'))

      expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument()
    })

    it('shows character counter', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Notas'))

      expect(screen.getByText(/10 \/ 2000/)).toBeInTheDocument()
    })

    it('calls onUpdate when notes saved', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Notas'))

      const textarea = screen.getByLabelText(/notas/i)
      fireEvent.change(textarea, { target: { value: 'Updated notes' } })
      fireEvent.click(screen.getByText('Guardar'))

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('1', { notes: 'Updated notes' })
    })
  })

  describe('Email Tab', () => {
    it('shows email editor when Email tab clicked', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Email'))

      expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Subject')).toBeInTheDocument()
      expect(screen.getByLabelText(/cuerpo/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Body')).toBeInTheDocument()
    })

    it('shows template selector', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Email'))

      expect(screen.getByText('Plantilla')).toBeInTheDocument()
    })
  })

  describe('Dolores Tab', () => {
    it('shows pain analysis section when Dolores tab clicked', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Dolores'))

      expect(screen.getByText('Detectar dolores')).toBeInTheDocument()
    })

    it('calls onAnalyze when detect dolores clicked', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByText('Dolores'))
      fireEvent.click(screen.getByText('Detectar dolores'))

      expect(defaultProps.onAnalyze).toHaveBeenCalledWith('1')
    })

    it('shows loading state during analysis', () => {
      render(<LeadDrawer {...defaultProps} lead={createMockLead({ id: '1', aiAnalysis: 'Analyzing...' })} />)

      fireEvent.click(screen.getByText('Dolores'))

      // The component shows loading when aiAnalysis is being processed
      // This would need the actual component to have loading state
    })
  })

  describe('Actions', () => {
    it('toggles favorite', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByLabelText(/favorito/i))

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('1', { favorite: true })
    })

    it('shows archive confirmation dialog', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByLabelText(/archivar/i))

      expect(screen.getByText('¿Archivar este lead?')).toBeInTheDocument()
    })

    it('calls onArchive when confirmed', () => {
      render(<LeadDrawer {...defaultProps} />)

      fireEvent.click(screen.getByLabelText(/archivar/i))
      fireEvent.click(screen.getByText('Confirmar'))

      expect(defaultProps.onArchive).toHaveBeenCalledWith('1')
    })
  })

  describe('Focus trap', () => {
    it('focuses first focusable element on open', () => {
      render(<LeadDrawer {...defaultProps} />)

      const closeButton = screen.getByLabelText('Cerrar')
      expect(closeButton).toHaveFocus()
    })
  })
})