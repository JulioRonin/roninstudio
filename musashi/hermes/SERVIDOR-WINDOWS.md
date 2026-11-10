# Hermes en tu PC con Windows (WSL2)

Hermes corre dentro de Ubuntu en WSL2. La PC debe quedarse encendida, con internet, y con la sesión de Windows iniciada. Tiempo estimado: 45 minutos la primera vez.

## 1 · Instalar Ubuntu en Windows (WSL2)

PowerShell **como administrador**:
```powershell
wsl --install -d Ubuntu-24.04
```
Reinicia cuando lo pida. Al abrir "Ubuntu 24.04" por primera vez, crea el usuario `ronin` con una contraseña.

Activa systemd dentro de Ubuntu (lo necesita `hermes gateway install`):
```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```
En PowerShell: `wsl --shutdown`, y vuelve a abrir Ubuntu. Comprueba: `systemctl is-system-running` debe decir `running` o `degraded`.

## 2 · Que la PC no se duerma y Ubuntu siga vivo

PowerShell como administrador:
```powershell
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 10
```
(La pantalla se apaga a los 10 minutos; la PC no.)

WSL apaga Ubuntu cuando no hay nada corriendo. Para que arranque al iniciar sesión y se quede:
1. Abre **Programador de tareas** → Crear tarea.
2. General: nombre `WSL Hermes`, marca "Ejecutar con los privilegios más altos".
3. Desencadenadores: "Al iniciar sesión".
4. Acciones: Programa `wsl.exe`, argumentos: `-d Ubuntu-24.04 -u ronin -- bash -lc "sleep infinity"`.
5. Condiciones: desmarca "Iniciar sólo si el equipo está conectado a la corriente" si es laptop.
6. Configuración: marca "Si la tarea falla, reiniciar cada 1 minuto".

Opcional: inicio de sesión automático de Windows (`netplwiz`, desmarca "Los usuarios deben escribir su nombre") para que tras un apagón todo levante solo. Es cómodo pero deja la PC abierta a quien la prenda; decide tú.

## 3 · Instalar Hermes (dentro de Ubuntu)

```bash
sudo apt update && sudo apt install -y git curl jq
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
exec bash
hermes setup          # proveedor y modelo; pega tu llave de Anthropic
hermes doctor
```

Skills y configuración de Musashi:
```bash
git clone https://github.com/JulioRonin/roninstudio.git ~/roninstudio
mkdir -p ~/.hermes/skills/musashi && cp -r ~/roninstudio/musashi/hermes/skills/* ~/.hermes/skills/musashi/
hermes config edit    # une aquí musashi/hermes/config.example.yaml
nano ~/.hermes/.env   # usa musashi/hermes/.env.example como guía
```

Secretos (guárdalos en un lugar seguro; también van a Vercel):
```bash
openssl rand -hex 24   # MUSASHI_API_KEY
openssl rand -hex 24   # WEBHOOK_SECRET  (= HERMES_WEBHOOK_SECRET)
openssl rand -hex 24   # API_SERVER_KEY  (= HERMES_API_KEY)
```

Higgsfield y ElevenLabs con tu cuenta:
```bash
hermes mcp login higgsfield
hermes mcp login elevenlabs
```
Si el navegador no se abre solo desde WSL, copia la URL que imprime y ábrela en Windows; si falla el regreso, usa `hermes mcp login higgsfield --flow device`.

Servicio y horarios:
```bash
sudo loginctl enable-linger ronin
hermes gateway install
systemctl --user status hermes-gateway   # o el nombre que muestre el instalador
cd ~/roninstudio/musashi/hermes && ./cron.sh
hermes cron list
curl -s localhost:8644/health && curl -s localhost:8642/health
```

## 4 · Que Vercel llegue a tu PC: Tailscale Funnel (en Windows)

1. Instala Tailscale para Windows desde tailscale.com e inicia sesión.
2. En el panel web de Tailscale activa **Funnel** (te lo pedirá el primer comando) y en DNS activa HTTPS certificates.
3. PowerShell:
```powershell
tailscale funnel --bg --https=443  8644
tailscale funnel --bg --https=8443 8642
tailscale funnel status
```
Te dará `https://<pc>.<tailnet>.ts.net` (webhooks) y `https://<pc>.<tailnet>.ts.net:8443` (API server). Windows reenvía esos puertos a Ubuntu automáticamente; comprueba desde PowerShell: `curl.exe https://<pc>.<tailnet>.ts.net/health`.

## 5 · Variables en Vercel (proyecto musashi)

| Variable | Valor |
|---|---|
| `MUSASHI_API_KEY` | primer secreto |
| `HERMES_WEBHOOK_URL` | `https://<pc>.<tailnet>.ts.net` |
| `HERMES_WEBHOOK_SECRET` | segundo secreto |
| `HERMES_API_URL` | `https://<pc>.<tailnet>.ts.net:8443` |
| `HERMES_API_KEY` | tercer secreto |

Luego en Musashi: Configuración → Hermes Agent → **Probar conexión**.

## Actualizar las skills cuando cambien en el repositorio (PowerShell)
```powershell
cd $HOME\roninstudio          # la carpeta donde clonaste el repositorio
git pull
# Hermes guarda las skills en dos lugares; se actualizan los dos y avisa si falta alguna
$raices = "$HOME\.hermes\skills", "$env:LOCALAPPDATA\hermes\skills"
foreach ($s in Get-ChildItem musashi\hermes\skills -Directory) {
  $dest = foreach ($r in $raices) { Get-ChildItem $r -Recurse -Directory -Filter $s.Name -ErrorAction SilentlyContinue }
  if (-not $dest) { "NO ENCONTRADA: $($s.Name)"; continue }
  foreach ($d in $dest) { Copy-Item "$($s.FullName)\*" $d.FullName -Force; "actualizada: $($d.FullName)" }
}
# El puente que usan los agentes para hablar con Musashi: debe decir CONEXION OK
python $HOME\.hermes\skills\musashi-base\musashi.py prueba
```
Debe salir al menos una línea `actualizada:` por cada una de las 14 skills (normalmente 28, una por cada lugar), ninguna `NO ENCONTRADA`, y `CONEXION OK · datos reales`. Después abre una sesión nueva en Hermes para que cargue la versión nueva. Si `python` no existe en tu terminal, usa el de Hermes: `& (Get-ChildItem $env:LOCALAPPDATA\hermes\tools -Recurse -Filter python.exe | Select-Object -First 1).FullName $HOME\.hermes\skills\musashi-base\musashi.py prueba`.

Cuando un agente corre de verdad, su respuesta termina con las líneas `PROPUESTA GUARDADA id=…` y `CORRIDA GUARDADA id=…`. Si en su lugar explica lo que haría o da ejemplos, no ejecutó nada. Las skills se leen del disco en cada corrida; sólo hay que reiniciar el gateway (stop, revisar puertos, start) si cambiaste el `.env`.
El archivo `$HOME\.hermes\.env` debe tener `MUSASHI_URL=https://musashi-three.vercel.app` (sin diagonal final) y `MUSASHI_API_KEY`. Prueba que un agente lee datos reales:
```powershell
$k = (Select-String -Path $HOME\.hermes\.env -Pattern '^MUSASHI_API_KEY=').Line.Split('=',2)[1].Trim()
Invoke-RestMethod -Uri "https://musashi-three.vercel.app/api/hermes/contexto?para=general" -Headers @{Authorization="Bearer $k"} | Select-Object demo, hoy, resumen
Remove-Variable k
```
Debe decir `demo: False`.

## Si algo falla
- `hermes doctor` primero.
- El webhook responde `Unknown route: musashi`: la ruta del `config.yaml` no se cargó. Créala como suscripción dinámica con el mismo secreto (se recarga sola, sin reiniciar):
  ```powershell
  $s = (Select-String -Path $HOME\.hermes\.env -Pattern '^WEBHOOK_SECRET=').Line.Split('=',2)[1].Trim()
  hermes webhook subscribe musashi --prompt "Evento de Musashi {event_type} para el agente {agente}. Carga la skill musashi-{agente} y ejecutala con este payload: {__raw__}" --deliver log --secret $s
  Remove-Variable s
  hermes webhook test musashi    # debe responder 202
  ```
  Ojo: el comando imprime el secreto; no compartas esa captura.
- `hermes gateway restart` dice "already running" o el puerto sigue ocupado: `hermes gateway stop`, luego `Get-NetTCPConnection -LocalPort 8642,8644 -State Listen | Select LocalPort, OwningProcess`, `Stop-Process -Id <PID> -Force` a cada uno y `hermes gateway start`.
- Los valores del `.env` van sin `< >` ni comillas.
- Ubuntu "se apagó": revisa que la tarea `WSL Hermes` esté corriendo en el Programador de tareas.
- `localhost:8644` responde en Ubuntu pero no en Windows: `wsl --shutdown` y abre Ubuntu de nuevo (reinicia el reenvío de puertos).
- Funnel no responde: `tailscale funnel status` y confirma que Funnel está habilitado para tu cuenta en el panel.

## Límite que aceptamos
Si la PC está apagada, dormida o sin internet, los agentes no corren en ese rato y los webhooks del Estudio fallan hasta que vuelva. Para Musashi, contigo como único usuario, está bien. Para agentes de clientes, usa el VPS.
