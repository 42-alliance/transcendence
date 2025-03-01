#!/bin/bash

# Installer les dépendances
npm install

# Démarrer le serveur

npm run build

# exec npm test --forceColor
exec sleep 1000