FROM nginx:latest

COPY conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/user_upload

WORKDIR /var/www/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
