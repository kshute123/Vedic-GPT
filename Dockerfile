FROM node:20-bullseye

# Install Python
RUN apt-get update && apt-get install -y python3 python3-venv python3-pip

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy everything else
COPY . .

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
