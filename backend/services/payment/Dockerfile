FROM node:18-alpine
WORKDIR /workspace
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production
COPY services/payment/package*.json ./services/payment/
RUN cd services/payment && npm install --production
COPY services/payment services/payment
COPY shared shared
WORKDIR /workspace/services/payment
EXPOSE 3005
CMD ["node", "index.js"]