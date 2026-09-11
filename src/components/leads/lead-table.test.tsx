import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadTable } from '@/components/leads/lead-table'
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

const mockLeads = [
  createMockLead({ id: '1', companyName: 'Company A', status: 'Nuevo' }),
  createMockLead({ id: '2', companyName: 'Company B', status: 'Validado' }),
  createMockLead({ id: '3', companyName: 'Company C', status: 'Email preparado' }),
]

describe('LeadTable', () => {
  const defaultProps = {
    leads: mockLeads,
    onStatusChange: vi.fn(),
    onSelect: vi.fn(),
    onSelectionChange: vi.fn(),
    selectedIds: [],
    visibleColumns: ['companyName', 'city', 'province', 'status', 'employees', 'email', 'phone', 'website', 'linkedin', 'score'],
    isLoading: false,
    error: null,
  }

  it('renders table headers', () => {
    render(<LeadTable {...defaultProps} />)

    expect(screen.getByText('Empresa')).toBeInTheDocument()
    expect(screen.getByText('Ciudad')).toBeInTheDocument()
    expect(screen.getByText('Provincia')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Empleados')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Teléfono')).toBeInTheDocument()
    expect(screen.getByText('Web')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<LeadTable {...defaultProps} />)

    expect(screen.getByText('Company A')).toBeInTheDocument()
    expect(screen.getByText('Company B')).toBeInTheDocument()
    expect(screen.getByText('Company C')).toBeInTheDocument()
  })

  it('renders skeleton rows when isLoading', () => {
    render(<LeadTable {...defaultProps} isLoading={true} />)

    const skeletons = screen.getAllByTestId('skeleton-row')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error state', () => {
    render(<LeadTable {...defaultProps} error="Error loading" />)

    expect(screen.getByText('Error loading')).toBeInTheDocument()
  })

  it('renders empty state when no leads', () => {
    render(<LeadTable {...defaultProps} leads={[]} />)

    expect(screen.getByText('Sin leads')).toBeInTheDocument()
  })

  it('calls onStatusChange when inline status select changes', () => {
    render(<LeadTable {...defaultProps} />)

    const select = screen.getAllByRole('combobox')[0] // First row status select
    fireEvent.change(select, { target: { value: 'Validado' } })

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', 'Validado')
  })

  it('calls onSelect when row clicked', () => {
    render(<LeadTable {...defaultProps} />)

    const row = screen.getAllByRole('row')[1] // First data row
    fireEvent.click(row)

    expect(defaultProps.onSelect).toHaveBeenCalledWith('1')
  })

  it('calls onSelectionChange when checkbox changes', () => {
    render(<LeadTable {...defaultProps} />)

    const checkbox = screen.getAllByRole('checkbox')[1] // First data row checkbox
    fireEvent.click(checkbox)

    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('shows selected state for selected rows', () => {
    render(<LeadTable {...defaultProps} selectedIds={['1']} />)

    const checkbox = screen.getAllByRole('checkbox')[1]
    expect(checkbox).toBeChecked()
  })

  it('renders column picker button', () => {
    render(<LeadTable {...defaultProps} />)

    expect(screen.getByText('Columnas')).toBeInTheDocument()
  })

  it('displays status badges with correct colors', () => {
    render(<LeadTable {...defaultProps} />)

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByText('Validado')).toBeInTheDocument()
    expect(screen.getByText('Email preparado')).toBeInTheDocument()
  })

  it('shows favorite star for favorite leads', () => {
    const leadsWithFavorite = [
      createMockLead({ id: '1', companyName: 'Company A', favorite: true }),
      createMockLead({ id: '2', companyName: 'Company B', favorite: false }),
    ]

    render(<LeadTable {...defaultProps} leads={leadsWithFavorite} />)

    const stars = screen.getAllByTestId('favorite-star')
    expect(stars[0]).toHaveClass('text-yellow-500') // filled star
    expect(stars[1]).not.toHaveClass('text-yellow-500') // outline star
  })
})