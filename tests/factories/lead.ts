import type { Lead, LeadStatus } from '@/lib/domain/lead'
import { faker } from '@faker-js/faker'

const STATUSES: LeadStatus[] = [
  'Nuevo',
  'Pendiente revisar',
  'Validado',
  'Email preparado',
  'Email enviado',
  'Respondió',
  'Reunión',
  'Cliente',
  'Descartado',
]

const PROVINCES = ['Valencia', 'Castellón', 'Alicante']
const CITIES = ['Valencia', 'Castellón', 'Sagunto', 'Mislata', 'Torrent', 'Paterna']

export function createLead(overrides: Partial<Lead> = {}): Lead {
  const id = overrides.id ?? faker.string.uuid()
  const now = new Date().toISOString()

  return {
    id,
    companyName: overrides.companyName ?? faker.company.name(),
    website: overrides.website ?? faker.internet.url(),
    phone: overrides.phone ?? faker.phone.number('+34 6## ### ###'),
    address: overrides.address ?? faker.location.streetAddress(),
    postalCode: overrides.postalCode ?? faker.location.zipCode('#####'),
    city: overrides.city ?? faker.helpers.arrayElement(CITIES),
    cityCanonical: overrides.cityCanonical ?? faker.helpers.arrayElement(CITIES),
    province: overrides.province ?? faker.helpers.arrayElement(PROVINCES),
    employees: overrides.employees ?? faker.number.int({ min: 1, max: 100 }),
    linkedin: overrides.linkedin ?? `https://linkedin.com/company/${faker.string.alphanumeric(8)}`,
    services: overrides.services ?? [faker.commerce.department()],
    status: overrides.status ?? faker.helpers.arrayElement(STATUSES),
    lastActivity: overrides.lastActivity ?? now,
    discoveredAt: overrides.discoveredAt ?? now,
    notes: overrides.notes ?? faker.lorem.paragraph(),
    notesOverflow: overrides.notesOverflow ?? null,
    emailSubject: overrides.emailSubject ?? 'Asunto de prueba',
    emailBody: overrides.emailBody ?? 'Cuerpo del email de prueba',
    score: overrides.score ?? faker.number.int({ min: 0, max: 100 }),
    manager: overrides.manager ?? faker.person.fullName(),
    role: overrides.role ?? faker.person.jobTitle(),
    confidence: overrides.confidence ?? 'Alta',
    software: overrides.software ?? 'Desconocido',
    source: overrides.source ?? 'n8n',
    email: overrides.email ?? faker.internet.email(),
    emailCommercial: overrides.emailCommercial ?? faker.internet.email(),
    emailManager: overrides.emailManager ?? faker.internet.email(),
    favorite: overrides.favorite ?? false,
    archived: overrides.archived ?? false,
    aiAnalysis: overrides.aiAnalysis ?? null,
    nextFollowUp: overrides.nextFollowUp ?? null,
  }
}

export function createLeadMinimal(overrides: Partial<Lead> = {}): Lead {
  return createLead({
    website: undefined,
    phone: undefined,
    address: undefined,
    postalCode: undefined,
    city: undefined,
    cityCanonical: undefined,
    province: undefined,
    employees: undefined,
    linkedin: undefined,
    services: [],
    notes: '',
    emailSubject: '',
    emailBody: '',
    score: 0,
    manager: undefined,
    role: undefined,
    confidence: undefined,
    software: undefined,
    source: undefined,
    email: undefined,
    emailCommercial: undefined,
    emailManager: undefined,
    aiAnalysis: undefined,
    nextFollowUp: undefined,
    ...overrides,
  })
}

export function createLeadsArray(count: number, overrides: Partial<Lead> = {}): Lead[] {
  return Array.from({ length: count }, () =>
    createLead({ ...overrides, id: overrides.id ?? faker.string.uuid() }),
  )
}

export function createDuplicateGroup(
  baseOverrides: Partial<Lead> = {},
  count = 3,
): Lead[] {
  const sharedEmail = faker.internet.email()
  const sharedPhone = faker.phone.number('+34 6## ### ###')
  const sharedDomain = faker.internet.domainName()

  return Array.from({ length: count }, (_, i) =>
    createLead({
      ...baseOverrides,
      id: faker.string.uuid(),
      email: i === 0 ? sharedEmail : (i === 1 ? undefined : sharedEmail),
      emailCommercial: i === 1 ? sharedEmail : undefined,
      phone: i === 0 ? sharedPhone : (i === 2 ? sharedPhone : undefined),
      website: `https://${sharedDomain}`,
      companyName: `${baseOverrides.companyName ?? faker.company.name()} ${i + 1}`,
    }),
  )
}

export function createLeadWithScore(
  score: number,
  overrides: Partial<Lead> = {},
): Lead {
  return createLead({ ...overrides, score })
}