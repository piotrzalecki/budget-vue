#!/bin/sh

# Set default values
VITE_API_BASE=${VITE_API_BASE:-https://budget-api.zalecki.uk/api/v1}

echo "Starting with VITE_API_BASE=$VITE_API_BASE"

# Replace VITE_API_BASE in the built JavaScript files if needed
if [ "$VITE_API_BASE" != "https://budget-api.zalecki.uk/api/v1" ]; then
  echo "Replacing API base URL in built files..."
  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|https://budget-api.zalecki.uk/api/v1|$VITE_API_BASE|g" {} \;
fi

# Generate nginx config
envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
