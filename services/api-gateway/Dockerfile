FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/api-gateway/package.json ./services/api-gateway/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/api-gateway ./services/api-gateway

WORKDIR /app/services/api-gateway
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/api-gateway ./services/api-gateway

WORKDIR /app/services/api-gateway
EXPOSE 3001
CMD ["pnpm", "start"]
