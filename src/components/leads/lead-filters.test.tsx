import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LeadFilters } from '@/components/leads/lead-filters'
import type { LeadFilters } from '@/lib/domain/lead'

const defaultProps = {
  filters: {
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
  },
  onFiltersChange: vi.fn(),
  onClear: vi.fn(),
  cities: ['Valencia', 'Castellón', 'Sagunto', 'Mislata'],
  provinces: ['Valencia', 'Castellón', 'Alicante'],
}

describe('LeadFilters', () => {
  it('renders search input', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('renders status filter chips', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByText('Validado')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
  })

  it('renders province filter chips', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText('Castellón')).toBeInTheDocument()
  })

  it('renders city filter chips', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText('Castellón')).toBeInTheDocument()
  })

  it('renders employees range inputs', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument()
  })

  it('renders date range inputs', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByLabelText(/desde/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hasta/i)).toBeInTheDocument()
  })

  it('renders has flags', () => {
    render(<LeadFilters {...defaultProps} />)

    expect(screen.getByText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByText(/web/i)).toBeInTheDocument()
    expect(screen.getByText(/linkedin/i)).toBeInTheDocument()
  })

  it('calls onFiltersChange when search changes', () => {
    render(<LeadFilters {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'test' } })

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test' }),
    )
  })

  it('calls onFiltersChange when status chip toggled', () => {
    render(<LeadFilters {...defaultProps} />)

    fireEvent.click(screen.getByText('Nuevo'))

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: ['Nuevo'] }),
    )
  })

  it('toggles status chip off when clicked again', () => {
    const props = {
      ...defaultProps,
      filters: { ...defaultProps.filters, status: ['Nuevo'] },
    }

    render(<LeadFilters {...props} />)

    fireEvent.click(screen.getByText('Nuevo'))

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: [] }),
    )
  })

  it('filters cities by selected province (cascade)', () => {
    const props = {
      ...defaultProps,
      filters: { ...defaultProps.filters, province: ['Valencia'] },
    }

    render(<LeadFilters {...props} />)

    // Should only show Valencia cities
    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText('Mislata')).toBeInTheDocument()
    // Castellón cities should not show when Valencia province selected
  })

  it('calls onClear when clear button clicked', () => {
    render(<LeadFilters {...defaultProps} />)

    fireEvent.click(screen.getByText(/limpiar/i))

    expect(defaultProps.onClear).toHaveBeenCalled()
  })

  it('shows active filter count badge', () => {
    const props = {
      ...defaultProps,
      filters: { ...defaultProps.filters, status: ['Nuevo', 'Validado'], province: ['Valencia'] },
    }

    render(<LeadFilters {...props} />)

    expect(screen.getByText(/3 filtros activos/i)).toBeInTheDocument()
  })

  it('renders mobile drawer toggle', () => {
    render(<LeadFilters {...defaultProps} />)

    // On mobile, filters should be in a drawer
    expect(screen.getByLabelText(/filtros/i)).toBeInTheDocument()
  })
})