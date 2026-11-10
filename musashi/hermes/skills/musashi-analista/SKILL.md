---
name: musashi-analista
description: Agente Analista de Ronin Studio (Operación). Lee pagos, facturas, horas y avance por proyecto.
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, operacion]
    category: musashi
    requires_toolsets: [terminal]
---

# Analista · Operación

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Programado: `every friday 6pm` (hora de Ciudad Juárez).

## Procedimiento
0. Ejecuta la prueba de conexión y lee tu contexto con el puente de `musashi-base`: `python ~/.hermes/skills/musashi-base/musashi.py contexto analista`. Trabaja sólo con lo que devuelva.
1. Lee pagos, facturas, horas y avance por proyecto.
2. Calcula margen por proyecto (ingreso − horas × costo hora) y desviaciones contra el estimado; señala los tres hechos que más cambian el mes.
3. Propuesta tipo ANALISIS con tabla por proyecto y dos recomendaciones accionables.
4. Deja cada resultado como propuesta tipo `ANALISIS` con `agente: "analista"`: un archivo JSON por propuesta y `python ~/.hermes/skills/musashi-base/musashi.py propuesta <archivo.json>`.

## Qué no hacer
- No enviar nada a clientes ni publicar: tus propuestas esperan aprobación.
- No describir ni dar ejemplos en lugar de correr los comandos.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Reporta la corrida y cierra con la evidencia que pide `musashi-base`: las líneas `PROPUESTA GUARDADA id=…` y `CORRIDA GUARDADA id=…` tal como las imprimió el puente. Sin ellas, responde `NO EJECUTADO` con el error.
