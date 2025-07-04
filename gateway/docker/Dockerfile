# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm openssl

WORKDIR /app

COPY . .

RUN chmod 777 ./script.sh

RUN mkdir -p ssl

RUN openssl req -newkey rsa:2048 -nodes -x509 -days 365 \
    -keyout /app/ssl/selfsigned.key \
    -out /app/ssl/selfsigned.crt \
    -subj "/C=FR/ST=France/L=Paris/O=42-Alliance/OU=Department/CN=localhost"

EXPOSE 3000

CMD ["sh", "/app/docker/script.sh"]