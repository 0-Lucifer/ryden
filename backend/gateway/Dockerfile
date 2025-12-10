FROM node:18-alpine

WORKDIR /app

COPY shared ./shared

COPY gateway/package*.json ./

RUN npm install --production

COPY gateway .

EXPOSE 3000

CMD ["node", "index.js"]
