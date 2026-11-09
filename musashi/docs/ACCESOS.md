# Musashi · llaves y accesos que necesita la plataforma

Lista de referencia, sin valores. Las llaves nunca van al repositorio: se guardan como variables de entorno en Vercel (producción y preview) y en el entorno de Hermes Agent. Este archivo sólo dice qué es cada una, dónde se obtiene y para qué sirve.

## 1 · Supabase (base de datos)

Musashi habla con Supabase sólo desde el servidor (route handlers en Vercel). El navegador nunca recibe llaves de Supabase y los agentes de Hermes tampoco: ellos pasan por la API de Musashi con `MUSASHI_API_KEY`. La base tiene RLS activo y sin políticas, así que la llave pública no lee ni escribe nada.

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → Data API (Project URL), o el botón **Connect** | Dirección del proyecto: `https://<ref>.supabase.co`. |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys (`sb_secret_…`) | Llave de servidor con todos los permisos. Sólo en Vercel, marcada como Sensitive. Si se filtra, se revoca ahí mismo y se crea otra. |

Esquema: `supabase/migrations/0001_musashi_base.sql`, se corre una vez en el SQL Editor.
Más adelante, si se usa Supabase Storage para archivos o el sitio público envía el diagnóstico exprés, se hará a través de rutas de Musashi, sin abrir la base.

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
| `HERMES_WEBHOOK_URL` / `HERMES_WEBHOOK_SECRET` | Instalación de Hermes (puerto 8644 vía túnel) · el secreto lo generamos nosotros | Musashi manda trabajo firmado a la ruta `musashi` (Estudio → Productor, etc.). |
| `HERMES_API_URL` / `HERMES_API_KEY` | Instalación de Hermes (puerto 8642 vía túnel) · `API_SERVER_KEY` | Que Musashi lea el estado de Hermes y, después, dispare corridas. |
| `MUSASHI_API_KEY` | La generamos nosotros | Los agentes la usan para leer contexto y dejar propuestas en la bandeja. |
| Tope mensual de tokens | Configuración de Hermes | Límite de gasto por agente (hoy: 3,000 MXN al mes en el plan). |

### Acceso a Musashi (login)

| Variable | Dónde se obtiene | Para qué |
|---|---|---|
| `MUSASHI_PASSWORD` | La eliges tú (16+ caracteres) | Contraseña de la pantalla de acceso. |
| `MUSASHI_SESSION_SECRET` | La generamos nosotros (48 caracteres hex) | Firma la cookie de sesión. Cambiarla cierra todas las sesiones abiertas. |

Sin estas dos variables en Vercel nadie puede entrar a Musashi. Las rutas que usan los agentes (`/api/hermes/propuestas` y `/api/hermes/contexto`) no piden sesión: piden `MUSASHI_API_KEY`.

## 5 · Contenido y voz

| Servicio | Variable | Dónde |
|---|---|---|
| Higgsfield (imagen y video) · **vía MCP, sin API** | Sin llave: autorización OAuth del servidor MCP de Higgsfield desde Hermes (una sola vez) | Usa el plan y los créditos de la cuenta, no la facturación de la API. El agente Productor llama al MCP con los prompts que arma el Estudio y devuelve las URLs a Musashi. |
| Higgsfield (alternativa) | `HIGGSFIELD_API_KEY` | Sólo si se decide usar la API de desarrolladores, que se cobra aparte del plan. |
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
