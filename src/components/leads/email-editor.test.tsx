import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmailEditor } from '@/components/leads/email-editor'

describe('EmailEditor', () => {
  const defaultProps = {
    subject: 'Test Subject',
    body: 'Test body content',
    onChange: vi.fn(),
    onTemplateApply: vi.fn(),
    onCopy: vi.fn(),
    canApplyTemplate: true,
  }

  it('renders subject input', () => {
    render(<EmailEditor {...defaultProps} />)

    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Subject')).toBeInTheDocument()
  })

  it('renders body textarea', () => {
    render(<EmailEditor {...defaultProps} />)

    expect(screen.getByLabelText(/cuerpo/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test body content')).toBeInTheDocument()
  })

  it('calls onChange when subject changes', () => {
    render(<EmailEditor {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/asunto/i), { target: { value: 'New Subject' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith({ subject: 'New Subject', body: 'Test body content' })
  })

  it('calls onChange when body changes', () => {
    render(<EmailEditor {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/cuerpo/i), { target: { value: 'New body' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith({ subject: 'Test Subject', body: 'New body' })
  })

  it('renders template selector', () => {
    render(<EmailEditor {...defaultProps} />)

    expect(screen.getByText(/plantilla/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls onTemplateApply when template selected', () => {
    render(<EmailEditor {...defaultProps} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'outreach-v1' } })

    expect(defaultProps.onTemplateApply).toHaveBeenCalledWith('outreach-v1')
  })

  it('shows confirmation dialog when applying template to non-empty body', () => {
    render(<EmailEditor {...defaultProps} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'outreach-v1' } })

    expect(screen.getByText(/aplicar plantilla/i)).toBeInTheDocument()
    expect(screen.getByText(/sobrescribir/i)).toBeInTheDocument()
  })

  it('calls onCopy when copy button clicked', () => {
    render(<EmailEditor {...defaultProps} />)

    fireEvent.click(screen.getByText(/copiar/i))

    expect(defaultProps.onCopy).toHaveBeenCalled()
  })

  it('shows character counter', () => {
    render(<EmailEditor {...defaultProps} />)

    expect(screen.getByText(/21 car/i)).toBeInTheDocument()
  })

  it('disables template selector when cannot apply', () => {
    render(<EmailEditor {...defaultProps} canApplyTemplate={false} />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})