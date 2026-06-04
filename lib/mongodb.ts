import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Cache the client promise across hot-reloads (dev) and warm serverless
// invocations (prod) so we don't open a new connection on every request.
const globalForMongo = global as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function connectDB(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('vela');
}

export async function getPositions(walletAddress: string) {
  const database = await connectDB();
  return database.collection('positions').find({ walletAddress }).toArray();
}

export async function upsertPositions(walletAddress: string, positions: any[]) {
  const database = await connectDB();
  const col = database.collection('positions');
  await col.deleteMany({ walletAddress });
  if (positions.length > 0) await col.insertMany(positions);
}

export async function saveQuery(query: any) {
  const database = await connectDB();
  return database.collection('queries').insertOne(query);
}

export async function getQueryHistory(walletAddress: string, limit = 10) {
  const database = await connectDB();
  return database.collection('queries')
    .find({ walletAddress })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

export async function upsertWallet(wallet: any) {
  const database = await connectDB();
  return database.collection('wallets').updateOne(
    { address: wallet.address },
    { $set: wallet },
    { upsert: true }
  );
}
