#!/bin/sh

CONFIG_FILE="/home/node/app/public/mjs/config.mjs"
TMP_FILE="${CONFIG_FILE}.tmp"

# Ersetze die erste Zeile durch die neue Backend-URL
{ 
  echo "export const backendUrl = '${BACKEND_URL}';"
  # Gib alle Zeilen ab der zweiten Zeile aus
  tail -n +2 "$CONFIG_FILE"
} > "$TMP_FILE"

mv "$TMP_FILE" "$CONFIG_FILE"

exec node client.js