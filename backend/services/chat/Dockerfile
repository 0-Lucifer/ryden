FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/chat/package*.json ./
RUN npm install --production
COPY ./services/chat .
EXPOSE 3007
CMD ["node", "index.js"]