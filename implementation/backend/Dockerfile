# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false


RUN npm install -g nodemon 



COPY . .
EXPOSE 4000
CMD ["nodemon","index.js"]
