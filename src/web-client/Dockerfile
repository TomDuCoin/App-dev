FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm ci --legacy-peer-deps
EXPOSE 8081
# Start the app
CMD [ "npm", "start" ]