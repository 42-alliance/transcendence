#!/bin/sh

# Ensure correct permissions before starting
chown -R nginx:nginx /data/files/

# Start NGINX
exec nginx -g "daemon off;"
