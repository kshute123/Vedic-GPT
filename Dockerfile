FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy dependency files first (for caching)
COPY package*.json ./

RUN npm install

# Copy rest of the app
COPY . .

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Build Next app
RUN npm run build

# Railway will inject PORT automatically
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "start"]
