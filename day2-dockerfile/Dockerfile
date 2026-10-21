FROM node:22-alpine

WORKDIR /app

ARG APP_VERSION=1.0.0

ENV PORT=3000 \
    APP_ENV=development \
    APP_VERSION=${APP_VERSION}

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY server.js ./

EXPOSE 3000

USER node

CMD ["node", "server.js"]
