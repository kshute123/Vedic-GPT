FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy everything into container
COPY . .

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
