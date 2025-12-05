FROM node:18-alpine

WORKDIR /workspace

# Copy shared package files and install dependencies
COPY shared/package*.json ./shared/
RUN cd shared && npm install --production

# Copy service package files
COPY services/auth/package*.json ./services/auth/

RUN cd services/auth && npm install --production

# Copy service code
COPY services/auth services/auth

# Copy shared modules
COPY shared shared

WORKDIR /workspace/services/auth

EXPOSE 3001

CMD ["node", "index.js"]
