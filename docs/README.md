# Documentación — Leads_CRM

Este directorio reúne la documentación funcional y técnica de Leads_CRM, la app de prospección para asesorías y gestorías.

## Lectura recomendada

1. [`CONTEXTO_NEGOCIO.md`](./CONTEXTO_NEGOCIO.md): por qué existe el producto, cliente ideal, propuesta de valor y flujo comercial.
2. [`DECISIONES.md`](./DECISIONES.md): decisiones de producto vigentes y no negociables.
3. [`GUIA_USO.md`](./GUIA_USO.md): instalación, configuración local y operación diaria.
4. [`ARQUITECTURA.md`](./ARQUITECTURA.md): estructura del sistema, capas, flujos y límites.
5. [`INTEGRACIONES.md`](./INTEGRACIONES.md): Notion, n8n, SerpAPI y configuración segura.
6. [`ESTADO_IMPLEMENTACION.md`](./ESTADO_IMPLEMENTACION.md): funcionalidades disponibles, limitaciones y deuda conocida.
7. [`ROADMAP.md`](./ROADMAP.md): fases de desarrollo previstas.

## Jerarquía de fuentes

Cuando dos documentos se contradigan, se aplica este orden:

1. [`DECISIONES.md`](./DECISIONES.md), por ser la especificación vigente.
2. Código en `src/`, para describir el comportamiento realmente implementado.
3. [`ROADMAP.md`](./ROADMAP.md), para trabajo futuro.
4. Notas de investigación en [`../Nicho/Asesoria y gestoria/contexto/1_notes.md`](../Nicho/Asesoria%20y%20gestoria/contexto/1_notes.md), que conservan decisiones históricas y contexto de negocio.

Las notas de `Nicho` son una fuente de investigación, no una especificación técnica vigente. Por eso:

- el producto usa **9 estados**, aunque las notas iniciales describan 4;
- la integración recomendada es **SerpAPI**, aunque algunas notas mencionen SearchAPI.io;
- Notion sigue siendo la fuente de verdad;
- no hay tags ni responsable en v1.

## Alcance actual

La aplicación es local y de un solo usuario. Permite sincronizar leads desde Notion, buscarlos, filtrarlos, abrir un panel de detalle, editar estado/notas/email, marcar favoritos y archivar registros.

Daily Work, Kanban y Email están operativos. Statistics completas, gestión visual de duplicados/merge y análisis IA ejecutable pertenecen a fases posteriores.
