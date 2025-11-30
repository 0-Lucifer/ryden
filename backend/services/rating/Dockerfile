FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/rating/package*.json ./
RUN npm install --production
COPY ./services/rating .
EXPOSE 3008
CMD ["node", "index.js"]