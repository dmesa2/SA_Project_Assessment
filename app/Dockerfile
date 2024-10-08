# Stage 1: Build Stage
FROM node:16-alpine as builder

# Set working directory inside the builder container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the builder stage
COPY . .

# Stage 2: Production Stage
FROM node:16-alpine

# Set working directory inside the production container
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Expose the port on which the app will run
EXPOSE 3000

# Command to run the application
CMD ["node", "src/app.js"]
