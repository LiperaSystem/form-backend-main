# Usar a imagem oficial do Node.js como base
FROM node:20

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
