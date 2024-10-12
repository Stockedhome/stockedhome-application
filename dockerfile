FROM node:20-slim AS no-static

WORKDIR /

COPY src/platforms/next/.next/standalone ./
COPY src/db/schema.prisma /schema.prisma

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /

ENV IS_DOCKER=true
ENV CONFIG_DIR=/config
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/platforms/next/server.js"]



FROM no-static AS with-static

WORKDIR /

COPY src/platforms/next/.next/static ./src/platforms/next/.next/static
COPY src/platforms/next/public ./src/platforms/next/public

ENV IS_DOCKER=true
ENV CONFIG_DIR=/config
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/platforms/next/server.js"]
