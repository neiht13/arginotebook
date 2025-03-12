// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_DB_39_URL;
const options = {
  // Các tùy chọn không cần thiết trong MongoDB Node.js Driver phiên bản mới
  // useNewUrlParser và useUnifiedTopology đã được mặc định trong các phiên bản mới
};

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Kiểm tra và sử dụng biến global trong môi trường phát triển
// if (process.env.NODE_ENV === 'development') {
//   // Trong TypeScript, mở rộng global để thêm thuộc tính _mongoClientPromise
//   declare global {
//     // eslint-disable-next-line no-var
//     var _mongoClientPromise: Promise<MongoClient>;
//   }

//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
  // Trong môi trường production, không sử dụng biến global
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
// }

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise;
    const db = client.db('nksx');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB (nksx):', error);
    throw error;
  }
}
