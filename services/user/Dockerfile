# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de l'application dans le conteneur
COPY package.json package-lock.json* ./
COPY . .

# Installer les dépendances de l'application
RUN npm install

# Exposer le port sur lequel l'application écoute (ajustez selon votre application)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "server"]