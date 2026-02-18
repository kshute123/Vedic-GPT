FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of project
COPY . .

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Build Next app
RUN npm run build

# Expose default port
EXPOSE 3000

# IMPORTANT: bind to Railway's PORT at runtime
CMD ["sh", "-c", "PORT=${PORT:-3000} npx next start -H 0.0.0.0 -p $PORT"]
