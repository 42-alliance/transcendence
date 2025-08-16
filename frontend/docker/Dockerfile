# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm openssl

WORKDIR /var/www/html

COPY . .

RUN chmod 777 ./script.sh

RUN mkdir -p /etc/ssl

RUN openssl req -newkey rsa:2048 -nodes -x509 -days 365 \
    -keyout /etc/ssl/selfsigned.key \
    -out /etc/ssl/selfsigned.crt \
    -subj "/C=FR/ST=France/L=Paris/O=42-Alliance/OU=Department/CN=localhost"

EXPOSE 80

CMD ["sh", "/var/www/html/docker/script.sh"]