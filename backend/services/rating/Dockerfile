FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/rating/package*.json ./services/rating/
RUN cd services/rating && npm install --production
COPY services/rating services/rating
COPY shared shared
WORKDIR /workspace/services/rating
EXPOSE 3008
CMD ["node", "index.js"]