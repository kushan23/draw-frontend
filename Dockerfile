FROM node:21.7.3

WORKDIR /app

COPY package*.json .

RUN corepack enable pnpm

RUN pnpm install

COPY . .

ENV NEXT_PUBLIC_BACKEND_URL="http://ec2-98-84-170-170.compute-1.amazonaws.com"
ENV NEXT_PUBLIC_WS_URL="ws://ec2-34-201-99-188.compute-1.amazonaws.com"

RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm start"]

