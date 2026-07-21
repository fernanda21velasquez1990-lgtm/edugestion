#!/usr/bin/env bash
set -euo pipefail

MENSAJE="${1:-Actualizar EduGestión}"

if [ ! -d ".git" ]; then
  echo "ERROR: ejecuta este comando dentro de la carpeta EDUGESTION."
  exit 1
fi

git add app.js index.html style.css config.js publicar.sh

if git diff --cached --quiet; then
  echo "No hay cambios nuevos para publicar."
  exit 0
fi

git commit -m "$MENSAJE"
git push origin main

echo "Cambios enviados a GitHub. Vercel iniciará la publicación automática."
