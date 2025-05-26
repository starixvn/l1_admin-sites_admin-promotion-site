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
COPY package.json yarn.lock tsconfig.json configs.ts configs.json next.config.ts tailwind.config.ts postcss.config.js ./
COPY configs ./configs
COPY public ./public
COPY src ./src

RUN yarn build

FROM hub.lumigame.com/docker-hub/library/node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/ ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 5000
CMD ["yarn", "start"]

