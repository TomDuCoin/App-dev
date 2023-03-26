FROM mongo:latest
WORKDIR /db
EXPOSE 27017
COPY setup-mongodb.js /docker-entrypoint-initdb.d/
COPY . .
