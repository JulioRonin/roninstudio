# Musashi ⇄ Hermes Agent

Los 13 agentes de Ronin Studio corren en Hermes Agent como **skills** (una carpeta por agente en `skills/`), con horario en `cron.sh` y conexión a Higgsfield y ElevenLabs por **MCP con la cuenta** (plan y créditos, no API de pago).

## Las dos direcciones

| Dirección | Mecanismo | Qué viaja |
|---|---|---|
| Hermes → Musashi | `GET /api/hermes/contexto?para=<agente>` y `POST /api/hermes/propuestas`, con `Authorization: Bearer MUSASHI_API_KEY` | Contexto para decidir; propuestas a la bandeja de aprobación |
| Musashi → Hermes | `POST /api/hermes/jobs` en Musashi firma con HMAC (Generic V2) y entrega a `POST <HERMES_WEBHOOK_URL>/webhooks/musashi` | Eventos: `musashi.productor.producir` (tomas del Estudio), `musashi.mapeador.visita`, `musashi.planeador.cotizacion_aceptada` |
| Estado | `GET /api/hermes/estado` en Musashi consulta `/health` del API server y del webhook | Lo ve Configuración → Hermes Agent |

## Instalación (en el servidor donde corra Hermes)

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup                       # modelo y proveedor
cp -r skills/* ~/.hermes/skills/musashi/
# une config.example.yaml con ~/.hermes/config.yaml y llena ~/.hermes/.env (ver .env.example)
hermes mcp login higgsfield        # OAuth una sola vez; usa el plan de la cuenta
hermes mcp login elevenlabs
hermes gateway install             # servicio en segundo plano (webhooks + API server + cron)
./cron.sh                          # crea los 10 trabajos programados
hermes cron list
```

Si Musashi está en Vercel y Hermes en tu red, expón los puertos 8642 y 8644 con TLS (Cloudflare Tunnel, Tailscale Funnel o un proxy) y pon esas URLs en Vercel como `HERMES_API_URL` y `HERMES_WEBHOOK_URL`.

## Variables en Vercel (proyecto musashi)

| Variable | Para qué |
|---|---|
| `MUSASHI_API_KEY` | Llave que usan los agentes para leer contexto y dejar propuestas. Genera 32+ caracteres aleatorios. |
| `HERMES_WEBHOOK_URL` | URL pública de la plataforma de webhooks de Hermes (puerto 8644). |
| `HERMES_WEBHOOK_SECRET` | El mismo secreto que `platforms.webhook.extra.routes.musashi.secret`. |
| `HERMES_API_URL` | URL pública del API server (puerto 8642), sólo para `/health` y corridas bajo demanda. |
| `HERMES_API_KEY` | `API_SERVER_KEY` de Hermes. |

Sin estas variables Musashi corre en modo demo: acepta propuestas y las acusa, pero no las guarda (eso llega con Supabase, tabla `propuestas_ia`).

## Agentes

| Agente | Grupo | Corre | Deja |
|---|---|---|---|
| Perfilador | Operación | every 2h | PERFIL |
| Seguimiento | Operación | weekdays at 8am | MENSAJE |
| Mapeador | Operación | manual | MAPA |
| Planeador | Operación | manual | ACTA |
| Reportero | Operación | every monday 9am | REPORTE |
| Cobrador | Operación | daily at 7:30am | MENSAJE |
| Analista | Operación | every friday 6pm | ANALISIS |
| Investigador | Investigación | every friday 7am | INFORME |
| Estratega | Marketing | every friday 12pm | CALENDARIO |
| Guionista | Marketing | weekdays at 10am | GUION |
| Productor | Marketing | webhook | TOMAS |
| Publicador | Marketing | every 30m | PUBLICACION |
| Analista de canal | Marketing | every monday 8am | METRICAS |

Todos proponen; ninguno actúa hacia terceros sin aprobación, salvo el Publicador con piezas ya aprobadas y programadas.

## Prueba rápida

```bash
# Hermes → Musashi
curl -s "$MUSASHI_URL/api/hermes/contexto?para=cobrador" -H "Authorization: Bearer $MUSASHI_API_KEY" | head -c 400
curl -s -X POST "$MUSASHI_URL/api/hermes/propuestas" -H "Authorization: Bearer $MUSASHI_API_KEY" -H "Content-Type: application/json" \
  -d '{"agente":"cobrador","tipo":"MENSAJE","titulo":"Prueba","cuerpo":"Hola, prueba de conexión.","referencia":"F-0000"}'
# Musashi → Hermes (desde la propia Musashi)
curl -s -X POST "$MUSASHI_URL/api/hermes/jobs" -H "Content-Type: application/json" -d '{"agente":"productor","evento":"ping"}'
```
