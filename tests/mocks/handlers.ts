import { http, HttpResponse } from 'msw'
import { createLead, createLeadsArray } from '../factories/lead'

const MOCK_LEADS = createLeadsArray(25)

let leadsDb = [...MOCK_LEADS]

export const handlers = [
  http.get('https://api.notion.com/v1/data-sources/:dataSourceId/query', async ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('start_cursor')
    const pageSize = parseInt(url.searchParams.get('page_size') || '100', 10)

    const start = cursor ? leadsDb.findIndex((l) => l.id === cursor) + 1 : 0
    const end = start + pageSize
    const page = leadsDb.slice(start, end)
    const hasMore = end < leadsDb.length
    const nextCursor = hasMore ? page[page.length - 1].id : undefined

    return HttpResponse.json({
      object: 'list',
      results: page.map((lead) => ({
        id: lead.id,
        created_time: lead.discoveredAt,
        last_edited_time: lead.lastActivity,
        archived: lead.archived,
        properties: {
          Empresa: { title: [{ text: { content: lead.companyName } }] },
          Web: { url: lead.website },
          Teléfono: { phone_number: lead.phone },
          Dirección: { rich_text: [{ text: { content: lead.address ?? '' } }] },
          CP: { rich_text: [{ text: { content: lead.postalCode ?? '' } }] },
          Ciudad: { rich_text: [{ text: { content: lead.city ?? '' } }] },
          Provincia: { select: { name: lead.province } },
          Empleados: { number: lead.employees },
          LinkedIn: { url: lead.linkedin },
          Servicios: { multi_select: lead.services.map((s) => ({ name: s })) },
          Estado: { select: { name: lead.status } },
          'Última actualización': { date: { start: lead.lastActivity } },
          'Fecha de descubrimiento': { date: { start: lead.discoveredAt } },
          Observaciones: { rich_text: [{ text: { content: lead.notes } }] },
          'Asunto email': { rich_text: [{ text: { content: lead.emailSubject } }] },
          'Email generado': { rich_text: [{ text: { content: lead.emailBody } }] },
          'Lead Score': { number: lead.score },
          Gerente: { rich_text: [{ text: { content: lead.manager ?? '' } }] },
          Cargo: { rich_text: [{ text: { content: lead.role ?? '' } }] },
          Confianza: { select: { name: lead.confidence ?? 'Media' } },
          Software: { rich_text: [{ text: { content: lead.software ?? '' } }] },
          Origen: { rich_text: [{ text: { content: lead.source ?? '' } }] },
          'Correo General': { email: lead.email },
          'Correo Comercial': { email: lead.emailCommercial },
          'Correo Gerente': { email: lead.emailManager },
          'Último contacto': { date: lead.lastActivity ? { start: lead.lastActivity } : null },
          'Próximo seguimiento': { date: lead.nextFollowUp ? { start: lead.nextFollowUp } : null },
          Favorito: { checkbox: lead.favorite },
          'Análisis IA': { rich_text: lead.aiAnalysis ? [{ text: { content: lead.aiAnalysis } }] : [] },
        },
      })),
      next_cursor: nextCursor,
      has_more: hasMore,
    })
  }),

  http.patch('https://api.notion.com/v1/pages/:pageId', async ({ params, request }) => {
    const { pageId } = params
    const body = await request.json() as Record<string, unknown>

    const leadIndex = leadsDb.findIndex((l) => l.id === pageId)
    if (leadIndex === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const lead = leadsDb[leadIndex]
    const properties = body.properties as Record<string, unknown>

    const updateFromProp = (key: string, prop: unknown) => {
      const p = prop as { select?: { name: string }; rich_text?: Array<{ text: { content: string } }>; number?: number; checkbox?: boolean; email?: string; url?: string; phone_number?: string; date?: { start: string } }
      if (p?.select?.name) return p.select.name
      if (p?.rich_text?.[0]?.text?.content !== undefined) return p.rich_text[0].text.content
      if (p?.number !== undefined) return p.number
      if (p?.checkbox !== undefined) return p.checkbox
      if (p?.email) return p.email
      if (p?.url) return p.url
      if (p?.phone_number) return p.phone_number
      if (p?.date?.start) return p.date.start
      return undefined
    }

    const updated = {
      ...lead,
      companyName: updateFromProp('Empresa', properties.Empresa) ?? lead.companyName,
      website: updateFromProp('Web', properties.Web) ?? lead.website,
      phone: updateFromProp('Teléfono', properties.Teléfono) ?? lead.phone,
      address: updateFromProp('Dirección', properties.Dirección) ?? lead.address,
      postalCode: updateFromProp('CP', properties.CP) ?? lead.postalCode,
      city: updateFromProp('Ciudad', properties.Ciudad) ?? lead.city,
      province: updateFromProp('Provincia', properties.Provincia) ?? lead.province,
      employees: updateFromProp('Empleados', properties.Empleados) ?? lead.employees,
      linkedin: updateFromProp('LinkedIn', properties.LinkedIn) ?? lead.linkedin,
      status: updateFromProp('Estado', properties.Estado) ?? lead.status,
      lastActivity: updateFromProp('Última actualización', properties['Última actualización']) ?? lead.lastActivity,
      notes: updateFromProp('Observaciones', properties.Observaciones) ?? lead.notes,
      emailSubject: updateFromProp('Asunto email', properties['Asunto email']) ?? lead.emailSubject,
      emailBody: updateFromProp('Email generado', properties['Email generado']) ?? lead.emailBody,
      score: updateFromProp('Lead Score', properties['Lead Score']) ?? lead.score,
      manager: updateFromProp('Gerente', properties.Gerente) ?? lead.manager,
      role: updateFromProp('Cargo', properties.Cargo) ?? lead.role,
      confidence: updateFromProp('Confianza', properties.Confianza) ?? lead.confidence,
      software: updateFromProp('Software', properties.Software) ?? lead.software,
      source: updateFromProp('Origen', properties.Origen) ?? lead.source,
      email: updateFromProp('Correo General', properties['Correo General']) ?? lead.email,
      emailCommercial: updateFromProp('Correo Comercial', properties['Correo Comercial']) ?? lead.emailCommercial,
      emailManager: updateFromProp('Correo Gerente', properties['Correo Gerente']) ?? lead.emailManager,
      favorite: updateFromProp('Favorito', properties.Favorito) ?? lead.favorite,
      aiAnalysis: updateFromProp('Análisis IA', properties['Análisis IA']) ?? lead.aiAnalysis,
      archived: body.archived ?? lead.archived,
    }

    leadsDb[leadIndex] = updated

    return HttpResponse.json({
      id: pageId,
      properties: {},
      archived: updated.archived,
    })
  }),

  http.post('https://api.notion.com/v1/pages', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const properties = body.properties as Record<string, unknown>

    const newLead = createLead({
      id: `new-${Date.now()}`,
      companyName: (properties.Empresa as { title: Array<{ text: { content: string } }> })?.title?.[0]?.text?.content ?? 'New Lead',
      ...(properties.Web as { url: string } ? { website: properties.Web.url } : {}),
      ...(properties.Teléfono as { phone_number: string } ? { phone: properties.Teléfono.phone_number } : {}),
      ...(properties.Dirección as { rich_text: Array<{ text: { content: string } }> } ? { address: properties.Dirección.rich_text[0]?.text?.content } : {}),
      ...(properties.CP as { rich_text: Array<{ text: { content: string } }> } ? { postalCode: properties.CP.rich_text[0]?.text?.content } : {}),
      ...(properties.Ciudad as { rich_text: Array<{ text: { content: string } }> } ? { city: properties.Ciudad.rich_text[0]?.text?.content } : {}),
      ...(properties.Provincia as { select: { name: string } } ? { province: properties.Provincia.select.name } : {}),
      ...(properties.Empleados as { number: number } ? { employees: properties.Empleados.number } : {}),
      ...(properties.LinkedIn as { url: string } ? { linkedin: properties.LinkedIn.url } : {}),
      ...(properties.Estado as { select: { name: string } } ? { status: properties.Estado.select.name } : {}),
      ...(properties.Observaciones as { rich_text: Array<{ text: { content: string } }> } ? { notes: properties.Observaciones.rich_text[0]?.text?.content } : {}),
      ...(properties['Correo General'] as { email: string } ? { email: properties['Correo General'].email } : {}),
    })

    leadsDb.unshift(newLead)

    return HttpResponse.json({
      id: newLead.id,
      properties: {},
    }, { status: 201 })
  }),

  http.post('https://api.notion.com/v1/comments', () => {
    return HttpResponse.json({ id: `comment-${Date.now()}` })
  }),

  http.post('https://api.notion.com/v1/blocks/:blockId/children', () => {
    return HttpResponse.json({ object: 'list', results: [] })
  }),

  http.get('https://api.notion.com/v1/blocks/:blockId/children', () => {
    return HttpResponse.json({ object: 'list', results: [] })
  }),

  http.post('https://api.groq.com/openai/v1/chat/completions', async () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              evidencia: [
                'Empresa del sector asesoría/gestoría detectada',
                'Web corporativa accesible',
                'Ubicación en área metropolitana Valencia',
              ],
              inferencia: [
                'Probable necesidad de cumplimiento normativo',
                'Posible interés en digitalización de procesos',
              ],
              especulacion: [
                'Podría estar evaluando cambio de asesoría',
                'Presupuesto estimado 500-2000€/mes',
              ],
            }),
          },
        },
      ],
    })
  }),

  http.post('http://localhost:5678/webhook/:action', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('http://localhost:3000/api/sync', () => {
    return HttpResponse.json({ success: true, synced: leadsDb.length })
  }),
]

export function resetMockDb() {
  leadsDb = [...MOCK_LEADS]
}

export function getMockLeads() {
  return [...leadsDb]
}

export function setMockLeads(newLeads: typeof leadsDb) {
  leadsDb = newLeads
}