FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/ride/package*.json ./
RUN npm install --production
COPY ./services/ride .
EXPOSE 3003
CMD ["node", "index.js"]