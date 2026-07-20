FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

# Génération d'un certificat auto-signé pour le dev local
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/C=FR/ST=Paris/L=Paris/O=RestaurantHub/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
