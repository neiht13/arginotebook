import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_DB_39_URL; // MongoDB URI should contain the database name
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_DB_39_URL) {
  throw new Error("Please add your Mongo URI to .env.local");
}

  
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the MongoClient is not repeatedly instantiated.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(client => ({
      client,
      db: client.db('nksx')
    }));
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(client => ({
    client,
    db: client.db('nksx')
  }));
}

export default clientPromise;
