FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/chat/package*.json ./services/chat/
RUN cd services/chat && npm install --production
COPY services/chat services/chat
COPY shared shared
WORKDIR /workspace/services/chat
EXPOSE 3007
CMD ["node", "index.js"]