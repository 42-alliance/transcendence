# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY . .

RUN chmod 777 ./tools/script.sh

EXPOSE 8765

CMD ["sh", "/app/tools/script.sh"]