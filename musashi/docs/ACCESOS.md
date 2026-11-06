# Musashi · llaves y accesos que necesita la plataforma

Lista de referencia, sin valores. Las llaves nunca van al repositorio: se guardan como variables de entorno en Vercel (producción y preview) y en el entorno de Hermes Agent. Este archivo sólo dice qué es cada una, dónde se obtiene y para qué sirve.

## 1 · Supabase (base de datos, autenticación, archivos)

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto → Settings → API | URL del proyecto; la usa el navegador. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable) | Settings → API | Llave pública del navegador; limitada por las políticas RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API | Llave de servidor con todos los permisos: sólo en Vercel (server) y en Hermes, nunca en el navegador. |
| `SUPABASE_DB_URL` (connection string, pooler) | Settings → Database | Migraciones y scripts; Hermes lee y escribe por aquí o por la API. |
| `SUPABASE_JWT_SECRET` | Settings → API | Validar sesiones desde servicios externos (Hermes, webhooks). |

Pendiente: crear el proyecto (hoy la cuenta está en el límite de 2 proyectos gratuitos; hay que pausar o borrar otro, o pasar a Pro). Región sugerida: us-east-2.

## 2 · Vercel (despliegue de Musashi y del sitio público)

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `VERCEL_TOKEN` | Account → Settings → Tokens | Sólo si Hermes o un script debe disparar despliegues o leer logs. Para el despliegue normal no hace falta: Vercel construye en cada push. |
| `VERCEL_TEAM_ID` / `VERCEL_PROJECT_ID` | Project → Settings → General | Acompañan al token. |
| `MUSASHI=1` | Ya existe en el proyecto `musashi` | Identifica el proyecto en scripts compartidos del repo. |

## 3 · Facturapi (CFDI 4.0)

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `FACTURAPI_SECRET_KEY_TEST` | Facturapi → Organización → API Keys (prueba) | Timbrar en pruebas mientras se valida el flujo. |
| `FACTURAPI_SECRET_KEY_LIVE` | Facturapi → API Keys (producción) | Timbrar facturas reales. |
| Certificado CSD (`.cer`, `.key`) y su contraseña | SAT (no es una variable: se suben una sola vez en Facturapi) | Firmar los CFDI. |
| Datos fiscales del emisor | Constancia de situación fiscal | RFC, razón social, régimen, código postal, serie y folio inicial. |
| `FACTURAPI_WEBHOOK_SECRET` | Facturapi → Webhooks | Recibir avisos de timbrado, cancelación y pago. |

## 4 · Hermes Agent (orquestación de los 13 agentes)

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Modelo principal de los agentes (Claude). |
| `OPENAI_API_KEY` (opcional) | platform.openai.com | Sólo si algún agente usa un modelo de OpenAI en la prueba de modelos. |
| `HERMES_API_URL` / `HERMES_API_KEY` | Instalación de Hermes (servidor propio o nube) | Que Musashi lea el estado de los agentes, dispare corridas y reciba propuestas. |
| `MUSASHI_WEBHOOK_SECRET` | La generamos nosotros | Firmar los mensajes que Hermes manda a la bandeja de aprobación. |
| Tope mensual de tokens | Configuración de Hermes | Límite de gasto por agente (hoy: 3,000 MXN al mes en el plan). |

## 5 · Contenido y voz

| Servicio | Variable | Dónde |
|---|---|---|
| Higgsfield (imagen y video) | `HIGGSFIELD_API_KEY` | Higgsfield → API; el saldo de créditos se consulta por API. |
| ElevenLabs (voz clonada, locuciones) | `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` | elevenlabs.io → Profile → API Keys; el voice id se crea al clonar la voz. |

## 6 · Canales (se conectan después, módulo Marketing)

| Servicio | Variables | Notas |
|---|---|---|
| WhatsApp Business (Meta Cloud API) | `META_APP_ID`, `META_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` | Mensajes del Cobrador y Seguimiento. Requiere número verificado y plantillas aprobadas. |
| Instagram (Meta Graph) | `IG_BUSINESS_ACCOUNT_ID`, mismo `META_ACCESS_TOKEN` | Publicar y leer métricas. Cuenta de empresa ligada a una página. |
| YouTube Data API | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, refresh token | Subir videos y leer métricas. |
| TikTok for Developers | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | Publicar y métricas; requiere revisión de la app. |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Publicar en la página de empresa. |
| Correo saliente | `RESEND_API_KEY` (o SMTP) | Reportes, cotizaciones y avisos por correo. |

## 7 · Pagos (cuando se cobre en línea)

| Servicio | Variables |
|---|---|
| Stripe (USD, El Paso) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Conciliación bancaria MXN | Se hace por estado de cuenta; sin llave. |

## Orden sugerido

1. Supabase (crear proyecto, llaves, esquema F0).
2. Vercel (variables de Supabase en producción y preview).
3. Facturapi en modo prueba.
4. Hermes con la llave de Anthropic y el tope de tokens.
5. Higgsfield y ElevenLabs.
6. Canales, uno por uno, empezando por WhatsApp.
