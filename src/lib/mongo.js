import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  connectTimeoutMS: 1000,
  serverSelectionTimeoutMS: 1000,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('❌ Please add MONGODB_URI to your .env.local');
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
