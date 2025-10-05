# syntax=docker/dockerfile:1

FROM node:20-bullseye AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY .env.local ./.env.local
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/out ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
