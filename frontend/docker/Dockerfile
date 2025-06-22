# Utilise l'image Alpine Linux comme base
FROM alpine:latest

# Installer Node.js et npm
RUN apk add --no-cache nodejs npm

WORKDIR /var/www/html

COPY . .

RUN chmod 777 ./script.sh

EXPOSE 80

CMD ["sh", "/var/www/html/docker/script.sh"]