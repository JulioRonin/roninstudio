---
name: musashi-cobrador
description: Agente Cobrador de Ronin Studio (Operación). Lee facturas vencidas y por vencer en 3 días.
version: 1.0.0
metadata:
  hermes:
    tags: [ronin, musashi, operacion]
    category: musashi
    requires_toolsets: [terminal]
---

# Cobrador · Operación

Carga también `musashi-base` (reglas de la casa, cómo leer contexto y dejar propuestas).

## Cuándo corre
Programado: `daily at 7:30am` (hora de Ciudad Juárez).

## Procedimiento
0. Ejecuta la prueba de conexión y lee tu contexto con el puente de `musashi-base`: `python ~/.hermes/skills/musashi-base/musashi.py contexto cobrador`. Trabaja sólo con lo que devuelva.
1. Usa `facturas_por_cobrar`: cada una trae `dias_vencida`, el cliente y su contacto con WhatsApp. Atiende las vencidas y las que vencen en 3 días.
2. Primer aviso (vencida 1 a 5 días): recordatorio cordial con folio, monto y fecha, ofreciendo ayuda con el complemento de pago. Segundo aviso (6 a 15 días): más directo, propone fecha de pago. Tercero: avisa que se pausa el trabajo hasta regularizar, según contrato.
3. Nunca envíes: deja la propuesta tipo MENSAJE con `referencia: <folio>` y `datos: { cliente_id, whatsapp, factura_id, aviso: 1|2|3 }`. Si el folio ya está en `tus_propuestas_pendientes`, no lo repitas.
4. Deja cada resultado como propuesta tipo `MENSAJE` con `agente: "cobrador"`: un archivo JSON por propuesta y `python ~/.hermes/skills/musashi-base/musashi.py propuesta <archivo.json>`.

## Qué no hacer
- No enviar nada a clientes ni publicar: tus propuestas esperan aprobación.
- No describir ni dar ejemplos en lugar de correr los comandos.
- No inventar datos ni cifras. No usar nombres de clientes que no vengan del contexto.

## Verificación
Reporta la corrida y cierra con la evidencia que pide `musashi-base`: las líneas `PROPUESTA GUARDADA id=…` y `CORRIDA GUARDADA id=…` tal como las imprimió el puente. Sin ellas, responde `NO EJECUTADO` con el error.
