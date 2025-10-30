# QR Backend

Backend serverless para el sistema de tarjetas QR de viajes.

## Variables de entorno requeridas

- `FIREBASE_SERVICE_ACCOUNT_BASE64` → contenido base64 de `serviceAccountKey.json`
- `FIREBASE_STORAGE_BUCKET` → ejemplo: `qrsumaviajes.appspot.com`
- `PUBLIC_HOSTING_URL` → ejemplo: `https://qrsumaviajes.web.app`
- `ALLOW_INSECURE=true` → (solo para pruebas locales sin autenticación)

## Instalar y probar localmente

```bash
npm install
export FIREBASE_SERVICE_ACCOUNT_BASE64="$(cat serviceAccount.base64.txt)"
export FIREBASE_STORAGE_BUCKET="qrsumaviajes.appspot.com"
export PUBLIC_HOSTING_URL="https://qrsumaviajes.web.app"
export ALLOW_INSECURE=true
node server.js

