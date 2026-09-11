# Roadmap Leads CRM

## ✅ v1.0 — Producto Completo (Fases 1–8)

Todas las fases completadas y verificadas. Ver `REPORTE_VERIFICACION_ROADMAP.md` para detalle.

---

## 🎨 v1.2 — Visual/UX/UI Refresh (En planificación)

**Objetivo**: "UX/UI más viva" — microinteracciones, motion 150ms, componentes elevados, fidelidad a Brand Identity (Rojo `#C62828`, Grafito `#1F2328`, Manrope, Gallo).

### Fases

#### Fase 1 — Foundation (Semana 1)
- [ ] **Design Tokens**: Extraer a Tailwind v4 `@theme` (colores, spacing, radius, shadows, transitions)
- [ ] **Dark Mode**: Implementación completa (actualmente básico)
- [ ] **Motion Tokens**: Duration 150ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`, `prefers-reduced-motion`
- [ ] **ui-ux-pro-max skill**: Instalar y generar `design-system/MASTER.md` para "SaaS dashboard minimal tech"
- [ ] **Component Audit**: Mapear shadcn actuales → versiones elevadas con referencias 21st.dev

#### Fase 2 — Core Components (Semana 1-2)
- [ ] **Kanban Board**: Adaptar componente framer-motion propio (9 columnas LeadStatus, persistir a Notion, acento Rojo en drag, indicador Rojo `#C62828`, Burn barrel → Archive)
- [ ] **Data Table Virtualizada**: TanStack Table + `@tanstack/react-virtual`, row hover lift+shadow 150ms, inline status badge, column picker persistente
- [ ] **Command Palette**: `Cmd+K` búsqueda global, shortcuts (`G L` leads, `G K` kanban, `G I` inbox)
- [ ] **Toast System**: Sonner → variantes mejoradas, progress toasts para sync, Rojo para errores
- [ ] **Skeleton/Loading**: Shimmer 21st.dev, Gallo runner (CSS spinner v1.2, Lottie v1.3)

#### Fase 3 — Page Implementation (Semana 2-3)
- [ ] **Home (`/`)**
  - [ ] Animated KPI counters (count-up on scroll)
  - [ ] Scroll-reveal sections (framer-motion `whileInView`)
  - [ ] Micro-chart sparklines por KPI
- [ ] **Leads (`/leads`)**
  - [ ] Tabla virtualizada con row hover
  - [ ] Inline actions + status select
  - [ ] Column picker + persistencia
- [ ] **Kanban (`/kanban`)**
  - [ ] 9 columnas LeadStatus
  - [ ] Drag → persistir Estado (PATCH existente)
  - [ ] Stats/Filters bar: filter chips + "Score" sort
- [ ] **Stats (`/stats`)**
  - [ ] Tabs: Estado / Provincia / Ciudad / Tamaño / Funnel
  - [ ] Recharts micro-charts en cards
  - [ ] Transiciones numéricas animadas
- [ ] **Inbox (`/inbox`)**
  - [ ] Card-based queues
  - [ ] Progress rings por cola
- [ ] **Email (`/email`)**
  - [ ] Split view editor/preview
  - [ ] Template gallery
- [ ] **Settings (`/settings`)**
  - [ ] Polish visual consistency

#### Fase 4 — Polish & Accessibility (Semana 3)
- [ ] Focus management (skip links, focus trap drawers/modals)
- [ ] ARIA live regions (sync status, toasts)
- [ ] Keyboard shortcuts implementados
- [ ] WCAG 2.2 AA contrast audit (Rojo on Grafito/White)
- [ ] Reduced motion respetado globalmente

### Dependencias a instalar
```bash
npm install framer-motion recharts @tanstack/react-virtual
# lucide-react ya instalado
# react-icons (para kanban actual) — evaluar migración a lucide
```

### Skills requeridos
- [x] `accessibility` (WCAG 2.2) — `.agents/skills/accessibility/`
- [x] `web-design-guidelines` (UI compliance) — `.agents/skills/web-design-guidelines/`
- [ ] `ui-ux-pro-max` (design intelligence) — instalar via opencode

### Referencias 21st.dev (para prompts futuros)
- `Scroll Choreography`, `Container Scroll Animation` — page transitions
- `Spotlight Card`, `Display Cards` — data display
- `Skeleton shimmer`, `Tilt card` — microinteractions
- `Velaris`, `WaterRippleImage` — hero/background effects
- `Command Palette` — global search

### Brand Identity (fuente: `.agents/GallaDev_brand-identity/`)
- **Colores**: Rojo `#C62828` (5-10%), Grafito `#1F2328` (20-30%), Blanco/Grices (60-70%)
- **Tipografía**: Manrope (principal), JetBrains Mono (técnica)
- **Iconografía**: Lucide outline (funcional), Gallo (microinteracciones: loading, 400)
- **Concepto**: "Minimalismo tecnológico humano"