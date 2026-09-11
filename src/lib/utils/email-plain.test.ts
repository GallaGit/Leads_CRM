import { describe, it, expect } from 'vitest'
import { splitNotes, domainFromUrl } from '@/lib/utils/email-plain'

describe('utils/email-plain - splitNotes', () => {
  it('returns observaciones and null overflow for text under 2000 chars', () => {
    const text = 'Short notes'
    const result = splitNotes(text)

    expect(result.observaciones).toBe('Short notes')
    expect(result.overflow).toBeNull()
  })

  it('splits at 2000 chars for long text', () => {
    const longText = 'x'.repeat(2500)
    const result = splitNotes(longText)

    expect(result.observaciones.length).toBe(2000)
    expect(result.overflow).toBe('x'.repeat(500))
  })

  it('handles exactly 2000 chars', () => {
    const text = 'x'.repeat(2000)
    const result = splitNotes(text)

    expect(result.observaciones.length).toBe(2000)
    expect(result.overflow).toBeNull()
  })

  it('handles 2001 chars', () => {
    const text = 'x'.repeat(2001)
    const result = splitNotes(text)

    expect(result.observaciones.length).toBe(2000)
    expect(result.overflow).toBe('x')
  })

  it('handles empty string', () => {
    const result = splitNotes('')

    expect(result.observaciones).toBe('')
    expect(result.overflow).toBeNull()
  })

  it('handles null/undefined', () => {
    expect(splitNotes(null as any)).toEqual({ observaciones: '', overflow: null })
    expect(splitNotes(undefined as any)).toEqual({ observaciones: '', overflow: null })
  })
})

describe('utils/email-plain - domainFromUrl', () => {
  it('extracts domain from https URL', () => {
    expect(domainFromUrl('https://example.com')).toBe('example.com')
    expect(domainFromUrl('https://www.example.com')).toBe('www.example.com')
    expect(domainFromUrl('https://sub.example.com/path')).toBe('sub.example.com')
  })

  it('extracts domain from http URL', () => {
    expect(domainFromUrl('http://example.com')).toBe('example.com')
    expect(domainFromUrl('http://www.example.com')).toBe('www.example.com')
  })

  it('extracts domain from bare domain', () => {
    expect(domainFromUrl('example.com')).toBe('example.com')
    expect(domainFromUrl('www.example.com')).toBe('www.example.com')
  })

  it('extracts domain from mailto', () => {
    expect(domainFromUrl('mailto:user@example.com')).toBeNull()
  })

  it('returns null for invalid/empty input', () => {
    expect(domainFromUrl('')).toBeNull()
    expect(domainFromUrl('not a url')).toBeNull()
    expect(domainFromUrl(null as any)).toBeNull()
    expect(domainFromUrl(undefined as any)).toBeNull()
  })

  it('handles URLs with port', () => {
    expect(domainFromUrl('https://example.com:8080')).toBe('example.com:8080')
  })

  it('handles URLs with path and query', () => {
    expect(domainFromUrl('https://example.com/path?query=1')).toBe('example.com')
  })
})