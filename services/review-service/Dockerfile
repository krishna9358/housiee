FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/review-service/package.json ./services/review-service/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/review-service ./services/review-service

WORKDIR /app/services/review-service
RUN npx prisma generate
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/review-service ./services/review-service

WORKDIR /app/services/review-service
EXPOSE 4004
CMD ["pnpm", "start"]
