FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/user/package*.json ./services/user/
RUN cd services/user && npm install --production
COPY services/user services/user
COPY shared shared
WORKDIR /workspace/services/user
EXPOSE 3002
CMD ["node", "index.js"]