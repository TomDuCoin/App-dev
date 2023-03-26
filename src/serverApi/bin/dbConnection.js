const { MongoClient, ObjectId } = require('mongodb');

const MONGO_VALIDATION_ERR = 121;

const DB_URL = `mongodb://${process.env.NODE_ENV === "prod" ? "database" : "localhost"}:27017`;
const DB_NAME = process.env.DB_NAME;

const uri = `${DB_URL}/${DB_NAME}`;
const client = new MongoClient(uri);

async function connectDb() {
    try {
        await client.connect();
        return client.db(DB_NAME);
    } catch (err) {
        console.error(`Server could not establish a connection with the database: ${err}`);
        client.close();
        throw err;
    }
}

module.exports = { connectDb, ObjectId , MONGO_VALIDATION_ERR }
