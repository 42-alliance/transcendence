#!/bin/bash

# Installer les dépendances
npm install

npx @tailwindcss/cli -i ./styles.css  -o ./output.css --watch &

export NODE_EXTRA_CA_CERTS=/app/ssl/ca.pem
exec npm run server