FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/notification/package*.json ./
RUN npm install --production
COPY ./services/notification .
EXPOSE 3006
CMD ["node", "index.js"]