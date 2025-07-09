FROM node:18.20-bullseye

USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .


EXPOSE 3001

CMD ["npm", "start"]