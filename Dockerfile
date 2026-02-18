FROM node:20

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN pip3 install --break-system-packages -r requirements.txt

RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
