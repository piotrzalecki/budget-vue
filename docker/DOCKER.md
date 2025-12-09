# Docker Setup for Budget Vue App

This document explains how to run the Budget Vue app in Docker with proper nginx configuration.

## Problem Solved

The original setup was trying to serve API endpoints as static files, causing 404 errors. This configuration:

1. **Proxies API requests** to your backend server
2. **Serves the Vue.js SPA** for all other routes (SPA fallback)
3. **Supports environment variables** for backend URL configuration

## Files Added/Modified

- `nginx.conf` - Custom nginx configuration with API proxy and SPA fallback
- `Dockerfile` - Updated to use custom nginx config with environment variable support
- `docker-compose.example.yml` - Example docker-compose setup

## Usage

### Option 1: With Docker Compose (Recommended)

1. Copy the example compose file:

   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```

2. Update the backend service in `docker-compose.yml` to point to your actual backend

3. Set environment variables in `docker-compose.yml`:

   ```yaml
   environment:
     - VITE_API_BASE=/api/v1
     - BACKEND_URL=http://your-backend-service:8080
   ```

4. Run the services:
   ```bash
   docker-compose up -d
   ```

### Option 2: Standalone Docker

1. Build the image:

   ```bash
   docker build -t budget-vue .
   ```

2. Run with environment variables:
   ```bash
   docker run -p 80:80 \
     -e VITE_API_BASE=/api/v1 \
     -e BACKEND_URL=http://your-backend:8080 \
     budget-vue
   ```

## Environment Variables

Both environment variables are set at **runtime** and can be configured in docker-compose:

- `VITE_API_BASE` - API base URL for the frontend (default: `/api/v1`)
- `BACKEND_URL` - URL of your backend API server (default: `http://localhost:8080`)

The startup script automatically replaces the API base URL in the built JavaScript files and configures nginx to proxy API calls to your backend.

## Nginx Configuration Features

- **API Proxy**: Routes `/api/*` requests to your backend
- **SPA Fallback**: Serves `index.html` for all non-API routes
- **Static Asset Caching**: Optimized caching for JS, CSS, images
- **Gzip Compression**: Reduces bandwidth usage
- **Security Headers**: Basic security headers included

## Troubleshooting

If you still see 404 errors for API calls:

1. Check that `BACKEND_URL` is set correctly
2. Verify your backend service is running and accessible
3. Check nginx logs: `docker logs <container-name>`
4. Ensure your backend is listening on the correct port

## Development vs Production

- **Development**: Use `vite.config.ts` proxy settings for local development
- **Production**: Use this Docker setup with nginx proxy for production deployment
