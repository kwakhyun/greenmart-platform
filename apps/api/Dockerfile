FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM deps AS builder
WORKDIR /app

COPY . .
RUN rm -f packages/shared/tsconfig.tsbuildinfo apps/api/tsconfig.tsbuildinfo
RUN npm run build -w packages/shared
RUN npm run build -w apps/api

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 api

COPY --from=builder --chown=api:nodejs /app/package.json ./package.json
COPY --from=builder --chown=api:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:nodejs /app/packages/shared ./packages/shared

USER api
EXPOSE 4000

CMD ["node", "apps/api/dist/src/main.js"]
