FROM node:20-bookworm

WORKDIR /app
COPY tsconfig.json .
COPY package.json .
COPY src/ src/
COPY prisma/ prisma/

RUN npm i
RUN npx prisma generate
RUN npm run build

ENTRYPOINT  npx prisma db push && node .
