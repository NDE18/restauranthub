FROM nginx:1.27-alpine

RUN apk add --no-cache openssl \
    && mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
         -keyout /etc/nginx/ssl/server.key \
         -out /etc/nginx/ssl/server.crt \
         -subj "/C=FR/ST=Paris/L=Paris/O=RestaurantHub/CN=localhost" \
    && apk del openssl

COPY nginx.conf /etc/nginx/nginx.conf

LABEL maintainer="restauranthub" \
      service="gateway" \
      version="1.0.0"

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
