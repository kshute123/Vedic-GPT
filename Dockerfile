# ---- Base Image ----
FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package files first (better Docker caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy rest of project files
COPY . .

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Build Next.js app
RUN npm run build

# Expose default Next.js port (Railway will override at runtime)
EXPOSE 3000

# Start Next.js using Railway's assigned PORT
CMD ["sh", "-c", "npm run start -- -p $PORT"]
