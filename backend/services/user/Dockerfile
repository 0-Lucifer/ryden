FROM node:18-alpine
WORKDIR /app
COPY ./shared ./shared
COPY ./services/user/package*.json ./
RUN npm install --production
COPY ./services/user .
EXPOSE 3002
CMD ["node", "index.js"]