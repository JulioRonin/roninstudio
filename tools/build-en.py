#!/usr/bin/env python3
"""Genera en/index.html (landing en inglés) a partir de index.html.

La landing en español es la fuente. Cada texto marcado con data-i18n="clave" tiene su
traducción en el diccionario `en` del <script> de index.html; lo que no lleva data-i18n
(título, descripción, vista previa al compartir, textos alternativos, ligas) se traduce aquí.

Uso, desde la raíz del repositorio, cada vez que cambie index.html:
    python3 tools/build-en.py
Falla con un mensaje claro si algún texto quedó sin traducir.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")
errores = []

# ---------- 1. Diccionarios del script ----------
def bloque(nombre):
    m = re.search(r"\n    %s: \{\n(.*?)\n    \}" % nombre, src, re.S)
    if not m: sys.exit(f"No encontré el diccionario '{nombre}' en index.html")
    return m.group(0), {k: json.loads('"' + v + '"') for k, v in re.findall(r'(\w+):"((?:[^"\\]|\\.)*)"', m.group(1))}
es_txt, ES = bloque("es")
en_txt, EN = bloque("en")

out = src

# ---------- 2. Textos con data-i18n ----------
usadas = re.findall(r'data-i18n="(\w+)"', src)
for k in sorted(set(usadas)):
    if k not in ES or k not in EN: errores.append(f"clave sin traducción en el diccionario: {k}"); continue
    viejo, nuevo = f'data-i18n="{k}">{ES[k]}</', f'data-i18n="{k}">{EN[k]}</'
    if out.count(viejo) != usadas.count(k): errores.append(f"el texto de '{k}' en el HTML no coincide con el diccionario es ({out.count(viejo)} de {usadas.count(k)})"); continue
    out = out.replace(viejo, nuevo)

# ---------- 3. Lo que no lleva data-i18n ----------
def cambia(a, b, n=1):
    global out
    if out.count(a) != n: errores.append(f"esperaba {n} vez/veces: {a[:90]!r} (hay {out.count(a)})"); return
    out = out.replace(a, b)

BASE = "https://www.roninstudio.com.mx/"
cambia('<html lang="es">', '<html lang="en">')
cambia("<title>Primero el flujo, después la IA | Ronin Studio · Juárez y El Paso</title>", "<title>Workflow first, AI second | Ronin Studio · Juárez and El Paso</title>")
cambia('content="Ronin Studio ordena cómo trabaja tu negocio y después lo automatiza, con software propio que ya opera en escuelas, restaurantes, talleres y comercializadoras de Juárez y El Paso."',
       'content="Ronin Studio puts how your business works in order and then automates it, with its own software already running in schools, restaurants, workshops and distributors in Juárez and El Paso."')
cambia(f'<link rel="canonical" href="{BASE}">', f'<link rel="canonical" href="{BASE}en/">')
cambia('<meta property="og:locale" content="es_MX">', '<meta property="og:locale" content="en_US">')
cambia('content="Tu operación, ordenada primero y automatizada después | Ronin Studio"', 'content="Your operation, organized first and automated second | Ronin Studio"')
cambia('content="Mapeamos cómo trabaja tu equipo, lo convertimos en un sistema que todos usan y metemos IA solo donde ya hay orden."',
       'content="We map how your team works, turn it into a system everyone uses, and add AI only where there is already order."')
cambia(f'<meta property="og:url" content="{BASE}">', f'<meta property="og:url" content="{BASE}en/">')
# El botón de idioma regresa a la versión en español
cambia('href="/en/" hreflang="en" lang="en" aria-label="English version">EN</a>', 'href="/" hreflang="es" lang="es" aria-label="Versión en español">ES</a>')
# El diagnóstico exprés todavía está sólo en español: en inglés, los llamados a la acción llevan al formulario
cambia('<a class="navlink-cta" href="/diagnostico/" data-i18n="ctaShort">', '<a class="navlink-cta" href="#contacto" data-i18n="ctaShort">')
cambia('<a class="cta-solid" href="/diagnostico/" data-i18n="ctaPrimary">', '<a class="cta-solid" href="#contacto" data-i18n="ctaPrimary">')
cambia('<a href="/diagnostico/" data-i18n="ctaShort">', '<a href="#contacto" data-i18n="ctaShort">')
cambia("?text=Hola%20Ronin%20Studio%2C%20quiero%20agendar%20un%20diagn%C3%B3stico%20de%20mi%20flujo%20de%20trabajo.", "?text=Hi%20Ronin%20Studio%2C%20I%27d%20like%20to%20schedule%20a%20diagnostic%20of%20my%20workflow.")
cambia("<dd>Claude · API de Anthropic</dd>", "<dd>Claude · Anthropic API</dd>")

# Textos alternativos y etiquetas de accesibilidad
ATRIBUTOS = {
    "Plataforma de Orka: índices de margen, diferencial competitivo, crédito y precios de combustibles en un solo tablero": "Orka platform: margin indexes, competitive spread, credit and fuel prices in a single dashboard",
    "Kanri: resumen operativo del taller con piezas en producción, aprobación de calidad, no conformidades y producción semanal": "Kanri: shop operations overview with parts in production, quality approval, non-conformances and weekly output",
    "Serie Método": "Method series",
    "Técnico recorriendo una línea de producción con su tableta": "Technician walking a production line with a tablet",
    "Manos en el teclado junto a un diagrama de flujo dibujado a mano": "Hands on a keyboard next to a hand-drawn flow diagram",
    "Operario en un taller de metal con la orden de trabajo en una tableta": "Operator in a metal shop with the work order on a tablet",
    "Cocina de restaurante en servicio; el gerente revisa la operación en una tableta": "Restaurant kitchen during service; the manager reviews operations on a tablet",
    "Ejemplo de conversación": "Sample conversation",
    "Panel de Kanri": "Kanri dashboard",
    "Punto de venta de Servirest": "Servirest point of sale",
    "Panel de operación multi-sucursal": "Multi-location operations dashboard",
    "Tablero ejecutivo de Mono Atelier": "Mono Atelier executive dashboard",
    "Dogma: mesa de diseño por pieza de una colección": "Dogma: design board for each piece of a collection",
    "App de Lana con saldos y movimientos difuminados": "Lana app with balances and transactions blurred",
    "Inicio de Vértice para la dirección escolar, con datos de demostración": "Vértice home screen for school leadership, with demo data",
    "Panel de Dojo con datos de demostración": "Dojo dashboard with demo data",
    "GENBA: panel de planta con balance de línea y cuello de botella": "GENBA: plant dashboard with line balance and bottleneck",
    "Andén: tablero de auditoría del transporte de personal": "Andén: audit dashboard for staff transportation",
    "Secciones": "Sections",
}
NEUTROS = {"", "Ronin Studio", "Julio César Ibarra", "Versión en español"}
def attr(m):
    nombre, valor = m.group(1), m.group(2)
    if valor in ATRIBUTOS: return f'{nombre}="{ATRIBUTOS[valor]}"'
    if valor not in NEUTROS: errores.append(f"{nombre} sin traducir: {valor!r}")
    return m.group(0)
cuerpo_i = out.index("<body>")
out = out[:cuerpo_i] + re.sub(r'\b(alt|aria-label)="([^"]*)"', attr, out[cuerpo_i:])

# ---------- 4. El script sólo necesita el diccionario en inglés ----------
cambia(es_txt + ",", "")

# ---------- 5. Revisión: no debe quedar español a la vista ----------
visible = re.sub(r"<!--.*?-->|<style.*?</style>|<script.*?</script>", " ", out, flags=re.S)
visible = re.sub(r'(?:href|src|srcset|imagesrcset|content|d|points|viewBox|class|id|style|name|for|value)="[^"]*"', " ", visible)
visible = re.sub(r"<[^>]+>", " ", visible)
PROPIOS = {"Juárez", "Vértice", "Andén", "Ramírez", "César", "Versión", "español"}
restos = sorted({w for w in re.findall(r"[\w¿¡]*[áéíóúñÁÉÍÓÚÑ¿¡][\w?!]*", visible) if w not in PROPIOS})
if restos: errores.append("posible español sin traducir: " + ", ".join(restos))

if errores:
    print("No se generó en/index.html:\n  - " + "\n  - ".join(errores)); sys.exit(1)
dest = ROOT / "en" / "index.html"
dest.parent.mkdir(exist_ok=True)
dest.write_text(out.replace("<head>", "<head>\n<!-- Generado con tools/build-en.py a partir de /index.html. No editar a mano. -->", 1), encoding="utf-8")
print(f"en/index.html generado · {len(set(usadas))} claves · {len(ATRIBUTOS)} textos alternativos")
