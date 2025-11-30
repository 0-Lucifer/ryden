FROM node:18-alpine

WORKDIR /app

# Copy shared folder at app root level
COPY ./shared ./shared

# Copy service package.json
COPY ./services/auth/package*.json ./

RUN npm install --production

# Copy all service files maintaining structure
COPY ./services/auth/ ./

EXPOSE 3001

CMD ["node", "index.js"]
