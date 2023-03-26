FROM node:16-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --legacy-peer-deps
COPY . .
EXPOSE 8080
CMD ["npm", "start"]