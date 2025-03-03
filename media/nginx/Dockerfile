FROM nginx:alpine

# Install WebDAV module
RUN apk add --no-cache nginx-mod-http-dav-ext

# Copy NGINX configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Copy and fix permissions for startup script
COPY tools/scripts.sh /scripts/scripts.sh
RUN chmod +x /scripts/scripts.sh

# Create necessary directories with correct permissions
RUN mkdir -p /data/files/incoming /data/files/upload \
    && chown -R nginx:nginx /data/files \
    && chmod -R 755 /data/files

# Expose port 9000 (ensure NGINX is configured to use it)
EXPOSE 9000

# Use the startup script
ENTRYPOINT ["/scripts/scripts.sh"]
