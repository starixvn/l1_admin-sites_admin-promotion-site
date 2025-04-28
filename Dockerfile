FROM hub.lumigame.com/docker-hub/library/node:22-alpine AS base
FROM base AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock tsconfig.json configs.json game-settings.json next.config.js next-i18next.config.js ./
COPY configs ./configs
COPY public ./public
COPY src ./src

RUN yarn build

FROM hub.lumigame.com/docker-hub/library/node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next  \
     && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000
ENV PORT 5000
CMD HOSTNAME="0.0.0.0" node server.js
