# Use Node base image
FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
