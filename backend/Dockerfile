FROM node:23.8-alpine AS builder

WORKDIR /app

COPY ./api/package.json ./api/package-lock.json ./

RUN npm ci --omit=dev

COPY ./api .

FROM node:23.8-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app /app

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["npx", "ts-node", "server.ts"]