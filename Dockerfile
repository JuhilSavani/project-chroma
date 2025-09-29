# Pull base image 
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci 

# Copy source code
COPY . ./

# Expose port 3000
EXPOSE 3000

CMD ["npm", "run", "dev"]