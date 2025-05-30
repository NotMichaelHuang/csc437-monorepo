import { MongoClient, Db } from "mongodb";

const {
  MONGO_USER,
  MONGO_PWD,
  MONGO_CLUSTER,
  DB_NAME
} = process.env;

// guard against missing env
if (!MONGO_USER || !MONGO_PWD || !MONGO_CLUSTER || !DB_NAME) {
  throw new Error("Missing one of MONGO_USER, MONGO_PWD, MONGO_CLUSTER, or DB_NAME in .env");
}

const uri = `mongodb+srv://${MONGO_USER}:${encodeURIComponent(MONGO_PWD)}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;

// instantiate *once*
export const mongoClient = new MongoClient(uri);

let _db: Db | null = null;

/**
 * Connects the client (if not already), and returns the `Db` instance
 */
export async function connectMongo(): Promise<Db> {
  if (!_db) {
    await mongoClient.connect();
    console.log("MongoDB connected");
    _db = mongoClient.db(DB_NAME);
  }
  return _db;
}



