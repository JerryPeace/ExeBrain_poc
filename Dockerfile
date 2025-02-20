FROM node:lts-alpine
WORKDIR /app
RUN npm install -g pnpm@9.12.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "start:dev"]