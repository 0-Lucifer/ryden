FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/notification/package*.json ./services/notification/
RUN cd services/notification && npm install --production
COPY services/notification services/notification
COPY shared shared
WORKDIR /workspace/services/notification
EXPOSE 3006
CMD ["node", "index.js"]