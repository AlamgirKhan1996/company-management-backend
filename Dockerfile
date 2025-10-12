# Use the official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port
EXPOSE 5000

RUN npx prisma generate


# Command to start the app
CMD ["npm", "start"]
