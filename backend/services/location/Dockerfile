FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/location/package*.json ./services/location/
RUN cd services/location && npm install --production
COPY services/location services/location
COPY shared shared
WORKDIR /workspace/services/location
EXPOSE 3004
CMD ["node", "index.js"]