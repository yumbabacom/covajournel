import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

// MongoDB connection options optimized for performance and reliability
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  maxPoolSize: 50, // Increased for better performance
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  maxConnecting: 2,
  retryWrites: true,
  retryReads: true,
  readPreference: 'primary' as const,
  writeConcern: { w: 'majority' as const, j: true },
  readConcern: { level: 'majority' as const },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let isConnecting = false;

// Connection health tracking
const connectionHealth = {
  connected: false,
  lastError: null as Error | null,
  retryCount: 0,
  maxRetries: 3,
};

const createConnection = async (): Promise<MongoClient> => {
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return client;
  }

  isConnecting = true;
  
  try {
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    connectionHealth.connected = true;
    connectionHealth.lastError = null;
    connectionHealth.retryCount = 0;
    
    // Set up connection event listeners
    client.on('close', () => {
      connectionHealth.connected = false;
    });
    
    client.on('error', (error) => {
      connectionHealth.lastError = error;
      connectionHealth.connected = false;
    });

    return client;
  } catch (error) {
    connectionHealth.lastError = error as Error;
    connectionHealth.retryCount++;
    console.error(`MongoDB connection failed (attempt ${connectionHealth.retryCount}):`, error);
    
    if (connectionHealth.retryCount < connectionHealth.maxRetries) {
      // Exponential backoff retry
      const delay = Math.pow(2, connectionHealth.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return createConnection();
    }
    
    throw error;
  } finally {
    isConnecting = false;
  }
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createConnection();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createConnection();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db('tradingcalc');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

// Collections with proper typing
export const COLLECTIONS = {
  USERS: 'users',
  TRADES: 'trades',
  CALCULATIONS: 'calculations',
  ACCOUNTS: 'accounts',
  STRATEGIES: 'strategies',
  JOURNAL: 'journal',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
