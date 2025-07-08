FROM node:18.18-bullseye-slim

USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .


EXPOSE 3001

CMD ["npm", "start"]