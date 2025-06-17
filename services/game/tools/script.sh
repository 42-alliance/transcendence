#!/bin/bash

# Installer les dépendances
npm install

npx prisma generate

# Appliquer les migrations et initialiser la base de données
npx prisma migrate dev --name init

# Démarrer le serveur
exec npm run server