---
name: musashi-productor
description: Agente Productor de Ronin Studio (Marketing). Se dispara con `musashi.productor.producir` desde el Estudio: trae `pieza` y `tomas` (prompt, modelo, tipo).
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, marketing]
    category: musashi
    requires_toolsets: [terminal]
---

# Productor · Marketing

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Lo dispara Musashi por webhook (ruta `musashi`, evento `musashi.productor.*`).

## Procedimiento
0. Lee tu contexto: `GET $MUSASHI_URL/api/hermes/contexto?para=general`.
1. Se dispara con `musashi.productor.producir` desde el Estudio: trae `pieza` y `tomas` (prompt, modelo, tipo).
2. Genera cada toma con el servidor MCP de Higgsfield (imagen con gpt_image_2_6 o el modelo indicado; video con image-to-video) y la locución con ElevenLabs usando la voz configurada. Espera a que cada trabajo termine.
3. Devuelve a Musashi una propuesta tipo TOMAS con `datos: { pieza, resultados: [{ toma, url, modelo, creditos }] , costo_creditos }`. Si algo falla, reporta la toma fallida y sigue con las demás.
4. Deja cada resultado como propuesta tipo `TOMAS` con `agente: "productor"` en `POST $MUSASHI_URL/api/hermes/propuestas`.

## Herramientas
Usa el servidor MCP `higgsfield` (configurado en `~/.hermes/config.yaml`, autorizado con OAuth: usa el plan de la cuenta, no la API de pago) y el MCP `elevenlabs`. Espera cada trabajo con la herramienta de espera del propio servidor antes de reportar.

## Qué no hacer
- No enviar nada a clientes ni publicar. Proponer, no ejecutar.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Cada propuesta debe responder 202. Termina con una línea: "Productor: N propuestas dejadas en Musashi".
