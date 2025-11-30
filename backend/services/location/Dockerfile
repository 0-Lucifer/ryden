FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/location/package*.json ./
RUN npm install --production
COPY ./services/location .
EXPOSE 3004
CMD ["node", "index.js"]