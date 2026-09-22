# Build context — loyiha root'i (docker-compose.yml: context: .), shuning uchun
# yo'llar frontend/ va nginx/ bilan boshlanadi.

# 1-bosqich: React (Vite) build
FROM node:24-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# 2-bosqich: Nginx bilan statikani tarqatish
FROM nginx:1.30-alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
