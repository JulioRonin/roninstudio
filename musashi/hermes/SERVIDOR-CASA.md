# Tu PC de casa como servidor de Hermes

Hermes no corre modelos localmente (van por API a Anthropic o al proveedor que elijas), así que la PC sólo necesita estar encendida, con internet por cable y Linux. Cualquier equipo con 8 GB de RAM y un SSD sobra. Si algún día quieres modelos locales con Ollama, ahí sí importa la GPU; hoy no.

## 0 · Decide el sistema

| Opción | Cuándo | Nota |
|---|---|---|
| **Ubuntu Server 24.04 LTS** (recomendada) | La PC será sólo servidor | Sin escritorio, arranca sola tras un apagón, menos mantenimiento. |
| Windows + WSL2 (Ubuntu) | La sigues usando como PC normal | Funciona, pero WSL se apaga si la sesión de Windows cierra; hay que dejar la sesión abierta y configurar inicio automático. |
| Windows nativo | Última opción | Hermes tiene instalador para Windows, pero la ruta probada por la documentación es Linux/WSL2. |

Lo que sigue asume Ubuntu Server.

## 1 · Preparar la máquina (una vez)

1. Instala Ubuntu Server 24.04 desde USB, usuario `ronin`, activa OpenSSH en el instalador.
2. En la BIOS: **Restore on AC power loss = Power On** (se prende sola tras un corte) y desactiva suspensión.
3. Conéctala por cable al módem. Si puedes, ponle IP fija en el módem (reserva DHCP).
4. Actualiza y asegura:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y ufw git curl jq
   sudo ufw default deny incoming && sudo ufw allow ssh && sudo ufw enable
   sudo systemctl disable --now sleep.target suspend.target hibernate.target hybrid-sleep.target
   ```
5. Acceso remoto sin abrir puertos del módem: **Tailscale**.
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up --ssh
   ```
   Instala Tailscale también en tu laptop y teléfono: desde ahí entras por `ssh ronin@<nombre-de-la-pc>` estés donde estés.

## 2 · Instalar Hermes

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup            # proveedor y modelo; pega ahí tu llave de Anthropic
hermes doctor
```

Copia las skills de Musashi y la configuración:
```bash
git clone https://github.com/JulioRonin/roninstudio.git ~/roninstudio
mkdir -p ~/.hermes/skills/musashi && cp -r ~/roninstudio/musashi/hermes/skills/* ~/.hermes/skills/musashi/
# une musashi/hermes/config.example.yaml con ~/.hermes/config.yaml  (hermes config edit)
# llena ~/.hermes/.env con musashi/hermes/.env.example como guía
hermes mcp login higgsfield     # OAuth con tu cuenta (plan y créditos, no API)
hermes mcp login elevenlabs
hermes gateway install          # servicio en segundo plano: webhooks (8644), API server (8642) y cron
cd ~/roninstudio/musashi/hermes && ./cron.sh
hermes cron list
```

Genera los secretos (guárdalos; van también a Vercel):
```bash
openssl rand -hex 24   # MUSASHI_API_KEY
openssl rand -hex 24   # HERMES_WEBHOOK_SECRET / WEBHOOK_SECRET
openssl rand -hex 24   # HERMES_API_KEY / API_SERVER_KEY
```

## 3 · Que Vercel pueda llegar a tu PC (sin abrir el módem)

Musashi vive en Vercel y necesita alcanzar los puertos 8644 (webhooks) y 8642 (API server). Dos opciones; ambas dan HTTPS y no tocan el router.

### Opción A · Tailscale Funnel (la más rápida, sin dominio)
```bash
sudo tailscale funnel --bg --https=443  8644   # webhooks
sudo tailscale funnel --bg --https=8443 8642   # API server
tailscale funnel status
```
Te da URLs tipo `https://<pc>.<tu-tailnet>.ts.net` y `https://<pc>.<tu-tailnet>.ts.net:8443`. Hay que activar Funnel una vez en el panel de Tailscale (te lo pide el comando).

### Opción B · Cloudflare Tunnel (si quieres `hermes.roninstudio.com.mx`)
Requiere que el DNS del dominio esté en Cloudflare.
```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
cloudflared tunnel login
cloudflared tunnel create hermes
cloudflared tunnel route dns hermes hooks.roninstudio.com.mx
cloudflared tunnel route dns hermes api-hermes.roninstudio.com.mx
```
`~/.cloudflared/config.yml`:
```yaml
tunnel: hermes
credentials-file: /home/ronin/.cloudflared/<id>.json
ingress:
  - hostname: hooks.roninstudio.com.mx
    service: http://localhost:8644
  - hostname: api-hermes.roninstudio.com.mx
    service: http://localhost:8642
  - service: http_status:404
```
```bash
sudo cloudflared service install
```
Extra recomendable: en Cloudflare Zero Trust, una política de Access para `api-hermes` que sólo deje pasar con un Service Token; los webhooks ya van firmados.

## 4 · Variables en Vercel (proyecto musashi)

| Variable | Valor |
|---|---|
| `MUSASHI_API_KEY` | el primer secreto |
| `HERMES_WEBHOOK_URL` | `https://<pc>.<tailnet>.ts.net` o `https://hooks.roninstudio.com.mx` |
| `HERMES_WEBHOOK_SECRET` | el segundo secreto (el mismo de `platforms.webhook.extra.routes.musashi.secret`) |
| `HERMES_API_URL` | `https://<pc>.<tailnet>.ts.net:8443` o `https://api-hermes.roninstudio.com.mx` |
| `HERMES_API_KEY` | el tercer secreto (el mismo de `API_SERVER_KEY`) |

Después, en Musashi: Configuración → Hermes Agent → **Probar conexión**. Las tres tarjetas deben quedar en verde.

## 5 · Mantenimiento mínimo

- `hermes doctor` y `hermes cron list` una vez a la semana (o deja que el Analista lo reporte).
- Actualizaciones de Ubuntu automáticas: `sudo apt install unattended-upgrades`.
- Respaldo de `~/.hermes` (config, skills, memoria, cron) con `tar` a tu nube una vez al mes.
- Si la luz se va seguido, un no-break pequeño evita corrupción del disco.

## Qué NO hacer
- No abrir puertos en el módem ni poner la PC en DMZ: el túnel ya resuelve el acceso.
- No dejar el API server en `0.0.0.0`; que escuche en `127.0.0.1` y salga sólo por el túnel.
- No guardar las llaves en el repositorio: viven en `~/.hermes/.env` y en Vercel.
