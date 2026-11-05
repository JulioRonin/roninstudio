#!/bin/sh
# Build compartido para los dos proyectos de Vercel que viven en este repo.
#
# - roninstudio (sitio público, estático): no hay nada que compilar.
# - musashi (plataforma interna): el proyecto tiene la variable MUSASHI=1.
#   Compila la app de Next.js como exportación estática y deja el resultado
#   en la raíz del deploy, reemplazando los archivos del sitio público.
set -e

if [ "$MUSASHI" != "1" ]; then
  echo "skip-build (sitio público)"
  exit 0
fi

echo "Compilando Musashi…"
cd musashi
npm ci --no-audit --no-fund
npm run build
cd ..

# Vaciar la raíz (salvo musashi) y poner la exportación estática en su lugar.
for f in * .[!.]*; do
  case "$f" in
    musashi|.git|.vercel|.vercelignore|vercel.json) ;;
    *) rm -rf "$f" ;;
  esac
done
cp -R musashi/out/. .
rm -rf musashi
echo "Musashi listo en la raíz del deploy"
ls -1 | head -30
