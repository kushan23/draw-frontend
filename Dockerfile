FROM node:21.7.3

WORKDIR /app

COPY package*.json .

RUN corepack enable pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL pnpm start"]

