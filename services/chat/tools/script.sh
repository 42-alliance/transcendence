#!/bin/bash

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations et initialiser la base de données
npx prisma migrate dev --name init

export NODE_EXTRA_CA_CERTS=/app/ssl/ca.pem
# Démarrer le serveur
exec npm run server