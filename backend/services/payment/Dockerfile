FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/payment/package*.json ./
RUN npm install --production
COPY ./services/payment .
EXPOSE 3005
CMD ["node", "index.js"]