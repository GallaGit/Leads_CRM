import { describe, it, expect } from 'vitest'
import {
  canonicalizeCity,
  CANONICAL_CITIES,
} from '@/lib/geo/cities'

describe('geo/cities - canonicalizeCity', () => {
  describe('Canonical cities (direct match)', () => {
    const canonicalCities = [
      'Valencia', 'Castellón', 'Sagunto', 'Mislata', 'Xirivella',
      'Torrent', 'Paterna', 'Manises', 'Burjassot', 'Alboraya',
      'Catarroja', 'Silla', 'Aldaia', 'Paiporta', 'Godella',
      'Moncada', 'Picassent', 'El Puig',
    ]

    for (const city of canonicalCities) {
      it(`returns canonical for "${city}"`, () => {
        expect(canonicalizeCity(city)).toBe(city)
      })
    }
  })

  describe('Aliases without accents', () => {
    it('normalizes "valencia" to "Valencia"', () => {
      expect(canonicalizeCity('valencia')).toBe('Valencia')
    })

    it('normalizes "castellon" to "Castellón"', () => {
      expect(canonicalizeCity('castellon')).toBe('Castellón')
    })

    it('normalizes "sagunt" to "Sagunto"', () => {
      expect(canonicalizeCity('sagunt')).toBe('Sagunto')
    })

    it('normalizes "alboraia" to "Alboraya"', () => {
      expect(canonicalizeCity('alboraia')).toBe('Alboraya')
    })

    it('normalizes "montcada" to "Moncada"', () => {
      expect(canonicalizeCity('montcada')).toBe('Moncada')
    })

    it('normalizes "castello" to "Castellón"', () => {
      expect(canonicalizeCity('castello')).toBe('Castellón')
    })
  })

  describe('Aliases with accents (listed in module)', () => {
    it('normalizes "València" to "Valencia"', () => {
      expect(canonicalizeCity('València')).toBe('Valencia')
    })

    it('normalizes "Castelló" to "Castellón"', () => {
      expect(canonicalizeCity('Castelló')).toBe('Castellón')
    })

    it('normalizes "Alboraia" to "Alboraya"', () => {
      expect(canonicalizeCity('Alboraia')).toBe('Alboraya')
    })

    it('normalizes "Montcada" to "Moncada"', () => {
      expect(canonicalizeCity('Montcada')).toBe('Moncada')
    })

    it('normalizes "Aldaya" to "Aldaia"', () => {
      expect(canonicalizeCity('Aldaya')).toBe('Aldaia')
    })
  })

  describe('Case insensitivity', () => {
    const testCases = [
      ['VALENCIA', 'Valencia'],
      ['valencia', 'Valencia'],
      ['VaLeNcIa', 'Valencia'],
      ['CASTELLÓN', 'Castellón'],
      ['castellón', 'Castellón'],
      ['SAGUNTO', 'Sagunto'],
      ['sagunto', 'Sagunto'],
    ]

    for (const [input, expected] of testCases) {
      it(`normalizes "${input}" to "${expected}"`, () => {
        expect(canonicalizeCity(input)).toBe(expected)
      })
    }
  })

  describe('Unknown cities', () => {
    it('returns trimmed input for unknown city', () => {
      expect(canonicalizeCity('Madrid')).toBe('Madrid')
      expect(canonicalizeCity('Barcelona')).toBe('Barcelona')
      expect(canonicalizeCity('Sevilla')).toBe('Sevilla')
    })

    it('trims whitespace', () => {
      expect(canonicalizeCity('  Madrid  ')).toBe('Madrid')
      expect(canonicalizeCity('\tBarcelona\n')).toBe('Barcelona')
    })

    it('returns null for empty input', () => {
      expect(canonicalizeCity('')).toBeNull()
      expect(canonicalizeCity('   ')).toBeNull()
      expect(canonicalizeCity(null)).toBeNull()
      expect(canonicalizeCity(undefined)).toBeNull()
    })
  })

  describe('Substring matching', () => {
    it('matches partial strings for known cities', () => {
      // The implementation does substring matching
      expect(canonicalizeCity('valencia capital')).toBe('Valencia')
      expect(canonicalizeCity('castellón de la plana')).toBe('Castellón')
    })
  })
})

describe('geo/cities - Constants', () => {
  it('CANONICAL_CITIES is a sorted array with 18 entries', () => {
    expect(Array.isArray(CANONICAL_CITIES)).toBe(true)
    expect(CANONICAL_CITIES.length).toBe(18)
    expect(CANONICAL_CITIES).toEqual([
      'Alboraya', 'Aldaia', 'Burjassot', 'Castellón', 'Catarroja',
      'El Puig', 'Godella', 'Manises', 'Mislata', 'Moncada',
      'Paiporta', 'Paterna', 'Picassent', 'Sagunto', 'Silla',
      'Torrent', 'Valencia', 'Xirivella',
    ])
  })

  it('CANONICAL_CITIES contains expected cities', () => {
    const expected = [
      'Valencia', 'Castellón', 'Sagunto', 'Mislata', 'Xirivella',
      'Torrent', 'Paterna', 'Manises', 'Burjassot', 'Alboraya',
      'Catarroja', 'Silla', 'Aldaia', 'Paiporta', 'Godella',
      'Moncada', 'Picassent', 'El Puig',
    ]

    for (const city of expected) {
      expect(CANONICAL_CITIES).toContain(city)
    }
  })
})