FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/ride/package*.json ./services/ride/
RUN cd services/ride && npm install --production
COPY services/ride services/ride
COPY shared shared
WORKDIR /workspace/services/ride
EXPOSE 3003
CMD ["node", "index.js"]