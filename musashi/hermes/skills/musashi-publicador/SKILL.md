---
name: musashi-publicador
description: Agente Publicador de Ronin Studio (Marketing). Revisa las piezas en estado Programada cuya hora ya llegó.
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, marketing]
    category: musashi
    requires_toolsets: [terminal]
---

# Publicador · Marketing

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Programado: `every 30m` (hora de Ciudad Juárez).

## Procedimiento
0. Ejecuta la prueba de conexión y lee tu contexto con el puente de `musashi-base`: `python ~/.hermes/skills/musashi-base/musashi.py contexto publicador`. Trabaja sólo con lo que devuelva.
1. Revisa las piezas en estado Programada cuya hora ya llegó.
2. Publica en el canal indicado con la integración configurada (Meta, YouTube, TikTok, LinkedIn). Es el único agente que actúa sin aprobación, y sólo para piezas ya aprobadas y programadas por una persona.
3. Reporta a Musashi tipo PUBLICACION con `datos: { pieza, canal, url, publicado_en }`; si la integración no está conectada, reporta 'pendiente de integración' sin publicar.
4. Deja cada resultado como propuesta tipo `PUBLICACION` con `agente: "publicador"`: un archivo JSON por propuesta y `python ~/.hermes/skills/musashi-base/musashi.py propuesta <archivo.json>`.

## Qué no hacer
- No enviar nada a clientes ni publicar: tus propuestas esperan aprobación.
- No describir ni dar ejemplos en lugar de correr los comandos.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Reporta la corrida y cierra con la evidencia que pide `musashi-base`: las líneas `PROPUESTA GUARDADA id=…` y `CORRIDA GUARDADA id=…` tal como las imprimió el puente. Sin ellas, responde `NO EJECUTADO` con el error.
