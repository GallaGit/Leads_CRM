# Guía de instalación y uso

## Requisitos

- Node.js 20 o superior.
- npm.
- Una integración de Notion con acceso a la base `Leads Asesorías Valencia`.
- El token interno de esa integración.

La aplicación se ejecuta localmente y no necesita una cuenta propia.

## Instalación

Desde la raíz del repositorio:

```bash
npm install
cp .env.example .env.local
```

En PowerShell, el último comando es:

```powershell
Copy-Item .env.example .env.local
```

Edita `.env.local` y configura, como mínimo:

```dotenv
NOTION_TOKEN=secret_xxxxxxxxx
NOTION_DATABASE_ID=ed07cdd4c5424f9a8b8ebd73e358c6cd
NOTION_DATA_SOURCE_ID=27fefc608dfd43569465582d3c49d99f
AUTH_DISABLED=true
```

No copies tokens en código, commits, capturas o documentación.

## Permisos de Notion

La integración debe tener acceso a `Leads Asesorías Valencia` y capacidades para:

- leer contenido;
- actualizar contenido;
- insertar bloques;
- crear comentarios, si se quiere el historial duplicado en comentarios.

Si los comentarios no están autorizados, las actualizaciones principales continúan y la actividad sigue guardándose en bloques.

## Arranque

```bash
npm run dev
```

Abre:

- Leads_CRM: [http://localhost:3000](http://localhost:3000)
- gestión de leads: [http://localhost:3000/leads](http://localhost:3000/leads)

Para comprobar una compilación de producción:

```bash
npm run build
npm start
```

## Primer uso

1. Abre `/leads`.
2. La aplicación intentará sincronizar automáticamente.
3. Comprueba el indicador de sincronización en la barra superior.
4. Si es necesario, pulsa **Sincronizar**.
5. Selecciona un lead para abrir el panel derecho.
6. Para alta manual, pulsa **Nuevo lead**, completa el formulario y guarda.

Si aparece `NOTION_TOKEN no configurado`, revisa `.env.local` y reinicia `npm run dev`.

## Trabajo diario

### Daily Work

En `/inbox` verás las colas del día (pendientes, datos incompletos, emails listos, follow-ups vencidos, posibles duplicados). Al abrir una cola se aplica el filtro en Leads y se abre el primer lead.

### Kanban

En `/kanban` arrastra tarjetas entre las 9 columnas de estado. El cambio se guarda en Notion.

### Email

En `/email` revisa borradores: edita, copia, marca como **Email preparado** o aplica la plantilla `outreach-v1` si el cuerpo está vacío (pide confirmación si no lo está). El botón **Redactar email** abre Gmail Compose con destinatario, asunto y cuerpo listos para revisar y enviar.

### Crear lead manual

En `/leads`, el botón **Nuevo lead** abre un formulario modal.

- Obligatorios: **Empresa** y al menos un canal de contacto (**correo general**, **teléfono** o **web**).
- El lead se crea en Notion con estado `Nuevo` y origen `Manual`.
- Si el sistema detecta un posible duplicado (mismo email, teléfono o dominio), avisa y pide confirmación antes de crear.
- Tras crear, se abre el panel del lead nuevo.

### Buscar

El buscador combina:

- nombre de empresa;
- web y dominio;
- email general;
- ciudad;
- provincia;
- LinkedIn.

La búsqueda no modifica Notion.

### Filtrar

Los filtros se combinan con lógica AND:

- estado;
- provincia;
- ciudad normalizada;
- número mínimo/máximo de empleados;
- fecha de creación;
- última actividad;
- presencia de email;
- presencia de teléfono;
- presencia de web;
- presencia de LinkedIn;
- favorito.

Ejemplo:

```text
Provincia = Valencia
Y Empleados >= 5
Y Empleados <= 30
Y Estado = Pendiente revisar
Y Con email
```

Pulsa **Limpiar** para quitar todos los filtros.

### Personalizar columnas

Los checkboxes de la barra de columnas muestran u ocultan campos. La configuración se guarda en el navegador.

### Abrir un lead

Haz clic en una fila. La URL se actualiza a:

```text
/leads?lead=<notion-page-id>
```

Ese enlace conserva el lead abierto al refrescar o compartir la ruta dentro del mismo entorno local.

### Cambiar estado

El estado puede cambiarse:

- inline desde la tabla;
- desde el panel derecho;
- de forma masiva tras seleccionar filas.

El cambio se persiste en Notion y registra actividad.

### Notas

1. Edita el campo en el panel.
2. Pulsa **Guardar notas**.
3. Hasta 2000 caracteres se guardan en `Observaciones`.
4. El excedente se guarda bajo `Notas` en el cuerpo de la página.

La UI avisa desde aproximadamente 1800 caracteres. Nunca se trunca texto en silencio.

### Email

El borrador se muestra como texto plano:

- los `<br>` históricos se convierten en saltos de línea;
- `\[Nombre\]` se presenta como `[Nombre]`;
- se elimina HTML residual básico.

Puedes editar asunto y cuerpo, guardarlos, copiarlos o guardarlos y marcar el lead como **Email preparado**.

### Favorito

La estrella de la tabla o del drawer actualiza la propiedad `Favorito` de Notion.

### Acciones externas

El drawer permite:

- abrir la web;
- abrir LinkedIn;
- buscar la dirección en Google Maps;
- abrir el cliente de correo;
- copiar email;
- copiar teléfono.

### Archivar

“Archivar” no elimina de forma permanente. Establece la página como archivada en Notion tras una confirmación.

La acción está disponible para un lead individual y para una selección.

### Duplicados

En `/duplicates` se listan grupos con el mismo email, teléfono o dominio web (también nombre o dirección normalizados; incluye archivados). Daily Work enlaza la cola de posibles duplicados hacia Leads; la fusión se hace aquí.

1. Elige un lead para **Conservar** y otro para **Archivar**.
2. Compara los campos lado a lado.
3. **Fusionar** rellena solo los campos vacíos del lead conservado y archiva el otro. Nunca sobrescribe valores existentes. Requiere confirmación.
4. **Solo archivar origen** archiva el lead marcado sin copiar campos.

Al fusionar o archivar, la lista de grupos se actualiza.

## Operaciones masivas

1. Selecciona una o más filas.
2. Usa la barra que aparece sobre la tabla.
3. Elige:
   - cambiar estado;
   - marcar favorito;
   - archivar.

Las actualizaciones se procesan secuencialmente contra Notion para reducir errores por límites de API.

## Tema

El botón de la esquina superior cambia entre tema claro y oscuro. El diseño está optimizado principalmente para escritorio y tablet.

## Estado de las demás secciones

Statistics (`/stats`) y Duplicados (`/duplicates`, merge incluido) están operativos. Automations muestra qué webhooks están configurados; la ejecución completa desde la UI sigue pendiente. Consulta [`ESTADO_IMPLEMENTACION.md`](./ESTADO_IMPLEMENTACION.md).

## Diagnóstico rápido

### No aparecen leads

- verifica `NOTION_TOKEN`;
- verifica `NOTION_DATA_SOURCE_ID`;
- comparte la base con la integración;
- reinicia el servidor después de cambiar `.env.local`;
- pulsa **Sincronizar** y lee el error mostrado.

### Error al editar

- comprueba que la integración tenga capacidad de actualización;
- comprueba que los nombres y tipos de propiedades coincidan con [`INTEGRACIONES.md`](./INTEGRACIONES.md);
- confirma que `Estado` conserve exactamente los 9 valores vigentes.

### La actividad no aparece

- abre un lead y realiza una acción significativa;
- comprueba que la integración pueda insertar bloques;
- revisa que el cuerpo de la página no haya cambiado manualmente los encabezados `Actividad` o `Notas`.

### n8n muestra “Sin webhook”

Es el comportamiento esperado mientras las variables `N8N_WEBHOOK_*` estén vacías. El workflow actual no fue modificado para añadir triggers.

## Calidad

Antes de entregar cambios:

```bash
npm run lint
npm run build
```
