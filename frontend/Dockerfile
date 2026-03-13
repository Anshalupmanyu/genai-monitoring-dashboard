# Stage 1: Build Angular App
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# Clean install relying on package-lock
RUN npm install --legacy-peer-deps

COPY . .
# Build production bundle
RUN npm run build --configuration=production

# Stage 2: Serve via Nginx
FROM nginx:alpine
# Copy built files to Nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
