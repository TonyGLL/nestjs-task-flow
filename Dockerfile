# Fase 1: Dependencias (Build)
FROM node:22-alpine AS build-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json ./
# Como no hay package-lock.json (el proyecto usa Bun), npm generará uno.
# En un entorno real de 100+ apps, se recomienda tener lockfiles consistentes.
RUN npm install

# Fase 2: Construcción
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Fase 3: Dependencias de Producción
FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

# Fase 4: Producción Final
FROM node:22-alpine AS release
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ARG APP_NAME
ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/${APP_NAME} ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/generated ./generated
COPY --from=builder /app/package.json ./package.json

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
