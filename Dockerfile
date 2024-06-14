# Use the official Node.js 18 image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Ensure the environment variables are available (you might use an actual .env file)
COPY .env ./

# Expose the port the app runs on
EXPOSE 9000

# Define the command to run the application
CMD ["npm", "start"]
