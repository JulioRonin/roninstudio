---
name: musashi-perfilador
description: Agente Perfilador de Ronin Studio (Operación). Lee el contexto general y detecta clientes o leads sin perfil (campo perfil_ia vacío) o con cambios recientes.
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, operacion]
    category: musashi
    requires_toolsets: [terminal]
---

# Perfilador · Operación

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Programado: `every 2h` (hora de Ciudad Juárez).

## Procedimiento
0. Lee tu contexto: `GET $MUSASHI_URL/api/hermes/contexto?para=general`.
1. Lee el contexto general y detecta clientes o leads sin perfil (campo perfil_ia vacío) o con cambios recientes.
2. Resume cada uno en cinco líneas: qué negocio es, qué duele, quién decide, en qué etapa del embudo va y cuál es el siguiente paso lógico.
3. No inventes datos: si falta algo, escribe 'sin dato' y propón la pregunta para la siguiente llamada.
4. Deja cada resultado como propuesta tipo `PERFIL` con `agente: "perfilador"` en `POST $MUSASHI_URL/api/hermes/propuestas`.

## Qué no hacer
- No enviar nada a clientes ni publicar. Proponer, no ejecutar.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Cada propuesta debe responder 202. Termina con una línea: "Perfilador: N propuestas dejadas en Musashi".
