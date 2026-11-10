---
name: musashi-planeador
description: Agente Planeador de Ronin Studio (Operación). Se dispara con `musashi.planeador.cotizacion_aceptada` (folio, cliente, hitos con horas).
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, operacion]
    category: musashi
    requires_toolsets: [terminal]
---

# Planeador · Operación

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Lo dispara Musashi por webhook cuando ocurre el evento; no corre solo.

## Procedimiento
0. Ejecuta la prueba de conexión y lee tu contexto con el puente de `musashi-base`: `python ~/.hermes/skills/musashi-base/musashi.py contexto planeador`. Trabaja sólo con lo que devuelva.
1. Se dispara con `musashi.planeador.cotizacion_aceptada` (folio, cliente, hitos con horas).
2. Redacta el acta de constitución: objetivo, alcance por hito, fuera de alcance, supuestos, riesgos iniciales, responsables y calendario por semanas a partir de la fecha de inicio.
3. Propón la EDT (entregables por hito) y el primer Gantt en semanas. Todo como borrador para aprobación.
4. Deja cada resultado como propuesta tipo `ACTA` con `agente: "planeador"`: un archivo JSON por propuesta y `python ~/.hermes/skills/musashi-base/musashi.py propuesta <archivo.json>`.

## Qué no hacer
- No enviar nada a clientes ni publicar: tus propuestas esperan aprobación.
- No describir ni dar ejemplos en lugar de correr los comandos.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Reporta la corrida y cierra con la evidencia que pide `musashi-base`: las líneas `PROPUESTA GUARDADA id=…` y `CORRIDA GUARDADA id=…` tal como las imprimió el puente. Sin ellas, responde `NO EJECUTADO` con el error.
