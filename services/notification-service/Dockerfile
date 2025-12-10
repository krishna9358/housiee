FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/notification-service/package.json ./services/notification-service/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/notification-service ./services/notification-service

WORKDIR /app/services/notification-service
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/notification-service ./services/notification-service

WORKDIR /app/services/notification-service
EXPOSE 4005
CMD ["pnpm", "start"]
