---
name: musashi-mapeador
description: Agente Mapeador de Ronin Studio (Operación). Se dispara cuando Musashi manda el evento `musashi.mapeador.visita` con las notas y fotos de una visita.
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, operacion]
    category: musashi
    requires_toolsets: [terminal]
---

# Mapeador · Operación

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Lo dispara Musashi por webhook cuando ocurre el evento; no corre solo.

## Procedimiento
0. Lee tu contexto: `GET $MUSASHI_URL/api/hermes/contexto?para=mapeador`.
1. Se dispara cuando Musashi manda el evento `musashi.mapeador.visita` con las notas y fotos de una visita.
2. Convierte las notas en inventario de procesos y pasos (quién, herramienta, minutos de trabajo, minutos de espera) con el formato del módulo Flujos de trabajo.
3. Marca como punto de atoro toda recaptura (mismo dato escrito dos veces) y toda espera mayor a 10 minutos. Propón acción por paso: mantener, simplificar, automatizar, agente IA o eliminar.
4. Deja cada resultado como propuesta tipo `MAPA` con `agente: "mapeador"` en `POST $MUSASHI_URL/api/hermes/propuestas`.

## Qué no hacer
- No enviar nada a clientes ni publicar. Proponer, no ejecutar.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Cada propuesta debe responder 201 (guardada en la bandeja) o 202. Al terminar, reporta tu corrida como indica `musashi-base`. Termina con una línea: "Mapeador: N propuestas dejadas en Musashi".
