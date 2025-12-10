FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/booking-service/package.json ./services/booking-service/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/booking-service ./services/booking-service

WORKDIR /app/services/booking-service
RUN npx prisma generate
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/booking-service ./services/booking-service

WORKDIR /app/services/booking-service
EXPOSE 4003
CMD ["pnpm", "start"]
