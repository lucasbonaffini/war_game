# Use the official Node.js image.
FROM node:18

# Create and set the working directory.
WORKDIR /src

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of your application code.
COPY . .

# Expose the port your app runs on.
EXPOSE 3000

# Command to run your application.
CMD [ "node", "app.js" ]
