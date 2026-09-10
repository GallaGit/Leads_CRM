# Spec UX — Detectar dolores (drawer Leads_CRM)

**Estado:** propuesto · **Repo:** GallaGit/Leads_CRM · **Superficie:** `LeadDrawer`  
**Tono:** ES, compacto Linear-like (denso, sin cards gordas, sin marketing copy).  
**Contrato producto (ROADMAP Fase 7):** acción → propiedad Notion `Análisis IA` en 3 capas: **evidencia / inferencia / especulación**.

## Hoy (as-is)

- No hay CTA «Detectar dolores».
- Si existe `lead.aiAnalysis`, se pinta un `<pre>` al final («Análisis IA») — ilegible como 3 bloques.
- Loading del drawer = skeleton de carga del lead; no hay estado de análisis.

## 1. Placement del botón

**Dónde:** barra de acciones del header del drawer (fila de iconos Web / LinkedIn / Maps / mail…), **después** de Favorito y **antes** de Archivar.

**Control:**
- Botón outline `size="sm"` (no solo icon): label **Detectar dolores**.
- Icono Lucide sugerido: `ScanSearch` o `Sparkles` (18px).
- Tooltip: «Analiza evidencia / inferencia / especulación y guarda en Análisis IA».

**Por qué ahí:** acción de calificación del lead, al alcance sin scroll; no enterrada tras Notas/Email; no compite con Guardar notas.

**Disabled cuando:**
- drawer aún `loading` el lead;
- análisis en curso (`analyzing`);
- lead sin mínimo señal (ver empty abajo) — opcional: permitir click y mostrar empty en panel.

**Re-run:** mismo botón; si ya hay análisis, label sigue «Detectar dolores» (no «Volver a…»); confirmación no hace falta en v1 (sobrescribe `Análisis IA`).

## 2. Estados: loading / vacío / error

Zona de resultado: sección fija **«Dolores»** (o «Análisis IA») **justo debajo de CRM** y **antes de Notas** — el operador la ve sin bajar al fondo.

### Idle (sin análisis)

- Un bloque muted 12px: «Aún no hay análisis. Pulsa Detectar dolores.»
- Sin fake 3 columnas vacías.

### Loading (`analyzing`)

- Botón: spinner + «Detectando…» + disabled.
- En la sección: 3 skeleton rows (altura ~48px cada una) con labels ya visibles: Evidencia · Inferencia · Especulación (opacity baja) — ancla el modelo mental de 3 bloques.
- No toast de éxito prematuro.

### Vacío (API OK, sin señal útil)

- Tras respuesta sin contenido usable (p.ej. sin web/notas/servicios):
  - Mensaje: «No hay señales suficientes en este lead.»
  - Hint 11px: «Añade web, servicios o notas y vuelve a intentar.»
- No inventar bullets.

### Error

- Banner inline compacto (borde + texto 12px), no modal:
  - «No se pudo detectar dolores.» + `error.message` corto.
  - Acción secundaria: **Reintentar** (mismo handler que el botón).
- Toast opcional solo si el fallo es de red genérico; preferir inline en la sección.

### Éxito

- Sustituye idle/loading por los 3 bloques.
- Toast corto opcional: «Análisis guardado» (si backend persiste en Notion).

## 3. Lectura del análisis — 3 bloques

Stack vertical (drawer 420px: **no** 3 columnas). Orden fijo:

| # | Label UI | Semántica | Estilo |
|---|----------|-----------|--------|
| 1 | **Evidencia** | Hechos observables del lead (web, servicios, tamaño, notas) | Label 11px uppercase muted; body 12.5px fg |
| 2 | **Inferencia** | Conclusiones razonables a partir de evidencia | Igual + borde-left 2px accent suave |
| 3 | **Especulación** | Hipótesis / apuestas | Igual + tip muted o badge «hipótesis» 10px |

Cada bloque:
- Título + cuerpo (párrafo o lista `•` máx ~5 bullets; sin markdown ruidoso).
- Separador 1px `--border` entre bloques.
- Si una capa viene vacía del API: mostrar el label + «—» (no ocultar la capa; mantiene el contrato de 3).

**Parseo:** si backend aún manda `aiAnalysis` string único, FE puede split por encabezados literales `Evidencia` / `Inferencia` / `Especulación` (case-insensitive). Preferible JSON/structured del API cuando exista — UI no inventa contenido.

**No-go**
- Un solo `<pre>` monolito.
- Wizard / modal a pantalla completa.
- Auto-run al abrir el drawer.
- Mezclar las 3 capas en un párrafo.

## Criterio hecho (UX)

1. CTA visible en header del drawer sin scroll.  
2. Loading con 3 skeletons etiquetados.  
3. Empty y error inline claros.  
4. Resultado en 3 bloques apilados evidencia → inferencia → especulación, encima de Notas.

## Fuera de alcance

- Cambiar copy del resto del drawer; bulk «detectar» en tabla; editar a mano los 3 bloques (v1 read-only + re-run).
