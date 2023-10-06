FROM node:20-bookworm

WORKDIR /app
COPY tsconfig.json .
COPY package.json .
COPY src/ src/

RUN npm i
RUN npm run build

CMD ["node", "."]
