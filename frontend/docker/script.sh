#!/bin/bash

# Installer les dépendances
npm install

npx @tailwindcss/cli -i ./styles.css  -o ./output.css --watch &

exec npm run server