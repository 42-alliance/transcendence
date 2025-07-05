#!/bin/bash

# Installer les dépendances
npm install

# Démarrer le serveur

npm run build

export NODE_EXTRA_CA_CERTS=/app/ssl/ca.pem
exec npm run server
