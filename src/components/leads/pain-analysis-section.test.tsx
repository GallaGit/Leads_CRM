import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PainAnalysisSection } from '@/components/leads/pain-analysis-section'
import type { PainAnalysis } from '@/lib/ai/pain-analysis'

const mockAnalysis: PainAnalysis = {
  evidence: ['Evidencia 1', 'Evidencia 2'],
  inference: ['Inferencia 1'],
  speculation: ['Especulación 1'],
}

const defaultProps = {
  leadId: '1',
  analysis: mockAnalysis,
  isLoading: false,
  hasSignal: true,
  onAnalyze: vi.fn(),
  onReanalyze: vi.fn(),
}

describe('PainAnalysisSection', () => {
  it('renders three sections with labels', () => {
    render(<PainAnalysisSection {...defaultProps} />)

    expect(screen.getByText('Evidencia')).toBeInTheDocument()
    expect(screen.getByText('Inferencia')).toBeInTheDocument()
    expect(screen.getByText('Especulación')).toBeInTheDocument()
  })

  it('renders items as bullets', () => {
    render(<PainAnalysisSection {...defaultProps} />)

    expect(screen.getByText('• Evidencia 1')).toBeInTheDocument()
    expect(screen.getByText('• Evidencia 2')).toBeInTheDocument()
    expect(screen.getByText('• Inferencia 1')).toBeInTheDocument()
    expect(screen.getByText('• Especulación 1')).toBeInTheDocument()
  })

  it('shows • — for empty sections', () => {
    const emptyAnalysis = {
      evidence: [],
      inference: [],
      speculation: [],
    }

    render(<PainAnalysisSection {...defaultProps} analysis={emptyAnalysis} />)

    expect(screen.getByText('• —')).toBeInTheDocument()
  })

  it('shows loading state when isLoading', () => {
    render(<PainAnalysisSection {...defaultProps} isLoading={true} />)

    expect(screen.getByText(/analizando/i)).toBeInTheDocument()
  })

  it('shows detect dolores button when hasSignal', () => {
    render(<PainAnalysisSection {...defaultProps} />)

    expect(screen.getByText('Detectar dolores')).toBeInTheDocument()
  })

  it('calls onAnalyze when detect dolores clicked', () => {
    render(<PainAnalysisSection {...defaultProps} />)

    fireEvent.click(screen.getByText('Detectar dolores'))

    expect(defaultProps.onAnalyze).toHaveBeenCalledWith('1')
  })

  it('calls onReanalyze when re-analyze clicked', () => {
    render(<PainAnalysisSection {...defaultProps} />)

    fireEvent.click(screen.getByText('Re-analizar'))

    expect(defaultProps.onReanalyze).toHaveBeenCalledWith('1')
  })

  it('hides detect button when no signal', () => {
    render(<PainAnalysisSection {...defaultProps} hasSignal={false} />)

    expect(screen.queryByText('Detectar dolores')).not.toBeInTheDocument()
    expect(screen.getByText(/sin señal/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<PainAnalysisSection {...defaultProps} error="Error de Groq" />)

    expect(screen.getByText('Error de Groq')).toBeInTheDocument()
  })
})