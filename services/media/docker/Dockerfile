# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY . .

RUN chmod 777 ./script.sh

EXPOSE 9000

CMD ["sh", "/app/docker/script.sh"]