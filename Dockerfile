FROM oven/bun:alpine as build
WORKDIR /usr/src/app

COPY . .
RUN bun install --frozen-lockfile --production
RUN bun build ./index.js --outdir ./dist --target bun

FROM node:22-alpine as release

ENV NODE_ENV=production

# COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .

ENTRYPOINT [ "node", "index.js" ]
