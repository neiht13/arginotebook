// mongo/client.ts
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_DB_39_URL
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_DB_39_URL) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

