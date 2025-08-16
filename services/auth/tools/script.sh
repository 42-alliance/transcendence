#!/bin/bash

# Installer les dépendances
npm install

export NODE_EXTRA_CA_CERTS=/app/ssl/ca.pem
# Démarrer le serveur
exec npm run server