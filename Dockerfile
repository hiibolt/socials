FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

ENV PORT=4000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 4000

CMD ["bun", "--bun", "run", "./build/index.js"]
