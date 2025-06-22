#!/bin/bash

# Installer les dépendances
npm install

# Démarrer le serveur

npm run build

exec npm run server
