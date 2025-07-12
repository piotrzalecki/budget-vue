# ---------- 1️⃣ Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci            # reproducible install
COPY . .
RUN npm run build     # produces dist/

# ---------- 2️⃣ Serve stage ----------
FROM nginx:alpine
# Disable default Nginx site
RUN rm /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]