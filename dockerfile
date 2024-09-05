FROM node:20-slim as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable




FROM node:20-slim as dependencies

WORKDIR /

COPY package.json pnpm-lock.json ./

RUN npm install -g pnpm

# also runs codegen
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile




FROM dependencies as build

WORKDIR /

COPY . .

RUN pnpm run build-next




FROM base as release

WORKDIR /

COPY --from=dependencies /node_modules ./node_modules

COPY --from=build /dist ./dist

CMD ["node", "dist/index.js"]
