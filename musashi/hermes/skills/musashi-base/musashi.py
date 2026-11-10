#!/usr/bin/env python3
"""Puente de los agentes de Hermes con Musashi. Funciona igual en Windows, macOS y Linux.

    python musashi.py prueba
    python musashi.py contexto <agente>
    python musashi.py propuesta <archivo.json>
    python musashi.py corrida <agente> "<resultado en una línea>" [--disparo manual|cron|webhook]
                                        [--tokens-entrada N] [--tokens-salida N] [--costo-mxn N]

Lee MUSASHI_URL y MUSASHI_API_KEY del entorno o de ~/.hermes/.env. Nunca imprime la llave.
Sale con código 0 sólo si Musashi confirmó; cualquier otra cosa es un error que debes reportar tal cual.
"""
import json, os, pathlib, sys, urllib.error, urllib.request

for flujo in (sys.stdout, sys.stderr):
    try: flujo.reconfigure(encoding="utf-8")
    except Exception: pass


def config():
    datos = {}
    env = pathlib.Path(os.environ.get("HERMES_HOME") or pathlib.Path.home() / ".hermes") / ".env"
    if env.exists():
        for linea in env.read_text(encoding="utf-8-sig", errors="replace").splitlines():
            if "=" in linea and not linea.lstrip().startswith("#"):
                k, v = linea.split("=", 1)
                datos[k.strip()] = v.strip().strip('"').strip("'")
    url = (os.environ.get("MUSASHI_URL") or datos.get("MUSASHI_URL") or "").rstrip("/")
    llave = os.environ.get("MUSASHI_API_KEY") or datos.get("MUSASHI_API_KEY") or ""
    if not url or not llave:
        fallo(f"Falta {'MUSASHI_URL' if not url else 'MUSASHI_API_KEY'} en el entorno y en {env}")
    return url, llave


def fallo(msg, codigo=1):
    print("ERROR: " + msg)
    sys.exit(codigo)


def pedir(metodo, ruta, cuerpo=None):
    url, llave = config()
    req = urllib.request.Request(url + ruta, method=metodo, headers={"Authorization": "Bearer " + llave, "Content-Type": "application/json; charset=utf-8", "User-Agent": "musashi-agente/1.1"},
                                 data=None if cuerpo is None else json.dumps(cuerpo, ensure_ascii=False).encode("utf-8"))
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        texto = e.read().decode("utf-8", errors="replace")
        try: detalle = json.loads(texto).get("error", texto)
        except Exception: detalle = texto[:300]
        fallo(f"Musashi respondió {e.code}: {detalle}")
    except Exception as e:
        fallo(f"No se pudo conectar con Musashi ({type(e).__name__}: {e})")


def opcion(args, nombre, defecto=None):
    if nombre in args:
        i = args.index(nombre)
        if i + 1 < len(args): return args[i + 1]
    return defecto


def main():
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help", "ayuda"):
        print(__doc__); return
    orden = a[0]
    if orden == "prueba":
        _, d = pedir("GET", "/api/hermes/contexto?para=general")
        if d.get("demo"): fallo("Musashi respondió en modo demo: no tiene base de datos conectada. No dejes propuestas.")
        print("CONEXION OK · datos reales · hoy " + str(d.get("hoy")) + " · " + json.dumps(d.get("resumen", {}), ensure_ascii=False))
    elif orden == "contexto":
        if len(a) < 2: fallo("Uso: musashi.py contexto <agente>")
        _, d = pedir("GET", "/api/hermes/contexto?para=" + a[1])
        if d.get("demo"): fallo("Musashi respondió en modo demo: no tiene base de datos conectada. No dejes propuestas.")
        print(json.dumps(d, ensure_ascii=False, indent=1))
    elif orden == "propuesta":
        if len(a) < 2: fallo("Uso: musashi.py propuesta <archivo.json>")
        try: cuerpo = json.loads(pathlib.Path(a[1]).read_text(encoding="utf-8-sig"))
        except Exception as e: fallo(f"No se pudo leer {a[1]} como JSON ({e})")
        estado, d = pedir("POST", "/api/hermes/propuestas", cuerpo)
        if estado != 201 or not d.get("id"): fallo(f"Musashi respondió {estado} sin guardar la propuesta: {json.dumps(d, ensure_ascii=False)[:300]}")
        print(f"PROPUESTA GUARDADA id={d['id']} · {cuerpo.get('tipo')} · {cuerpo.get('titulo')}")
    elif orden == "corrida":
        if len(a) < 3: fallo('Uso: musashi.py corrida <agente> "<resultado>" [--disparo manual]')
        num = lambda x: float(x) if x not in (None, "") else None
        estado, d = pedir("POST", "/api/hermes/corridas", {"agente": a[1], "resultado": a[2], "disparo": opcion(a, "--disparo", "manual"),
                          "tokens_entrada": num(opcion(a, "--tokens-entrada")), "tokens_salida": num(opcion(a, "--tokens-salida")), "costo_mxn": num(opcion(a, "--costo-mxn"))})
        if estado != 201: fallo(f"Musashi respondió {estado} sin guardar la corrida")
        print(f"CORRIDA GUARDADA id={d.get('id')}")
    else:
        fallo(f"Orden desconocida: {orden}. Usa prueba, contexto, propuesta o corrida.")


if __name__ == "__main__":
    main()
