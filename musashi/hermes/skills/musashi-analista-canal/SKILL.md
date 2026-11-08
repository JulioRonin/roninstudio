---
name: musashi-analista-canal
description: Agente Analista de canal de Ronin Studio (Marketing). Lee métricas de las piezas publicadas la semana anterior (alcance, guardados, comentarios, clics al diagnóstico exprés, leads).
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, marketing]
    category: musashi
    requires_toolsets: [terminal]
---

# Analista de canal · Marketing

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Programado: `every monday 8am` (hora de Ciudad Juárez).

## Procedimiento
0. Lee tu contexto: `GET $MUSASHI_URL/api/hermes/contexto?para=analista-canal`.
1. Lee métricas de las piezas publicadas la semana anterior (alcance, guardados, comentarios, clics al diagnóstico exprés, leads).
2. Identifica los tres mejores ganchos y el peor formato; propón qué repetir y qué dejar.
3. Propuesta tipo METRICAS con tabla por pieza y tres aprendizajes; estos alimentan al Estratega como señales.
4. Deja cada resultado como propuesta tipo `METRICAS` con `agente: "analista-canal"` en `POST $MUSASHI_URL/api/hermes/propuestas`.

## Qué no hacer
- No enviar nada a clientes ni publicar. Proponer, no ejecutar.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Cada propuesta debe responder 202. Termina con una línea: "Analista de canal: N propuestas dejadas en Musashi".
