# Musashi

Plataforma interna de Ronin Studio (en honor a Miyamoto Musashi): clientes, diagnósticos, proyectos, tareas, finanzas, facturación, agentes y marketing.

## Estado

Primera versión para validar el diseño. Todo corre en **modo demo** con datos de ejemplo en memoria; todavía no hay backend ni autenticación.

## Correr en local

```bash
cd musashi
npm install
npm run dev      # http://localhost:3100
```

## Estructura

- `app/` · una carpeta por pantalla (`/`, `/marketing`, `/clientes`, `/diagnosticos`, `/proyectos`, `/tareas`, `/finanzas`, `/facturacion`, `/agentes`, `/configuracion`).
- `components/shell.tsx` · franja de modo demo, encabezado con navegación, bandeja de aprobación (atajos A / E / D), toast y `PageHead`.
- `components/ui.tsx` · piezas del sistema visual: panel de vidrio, glifo R, botones píldora, pestañas, chips, campos.
- `components/table.tsx` y `components/board.tsx` · tabla genérica y tablero kanban (equivalen a "Ronin Table" y "Ronin Board" del diseño).
- `lib/tokens.ts` · Paleta Planta y estilos base; `lib/demo.ts` · datos de ejemplo.
- `design/` · handoff original de Claude Design (referencia; no forma parte del build).

## Despliegue

Proyecto `musashi` en Vercel con raíz `musashi/`, desplegado desde la rama de trabajo. El sitio público de roninstudio.com.mx excluye esta carpeta mediante `.vercelignore`.
