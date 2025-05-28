import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(TRADES_FILE)) {
  fs.writeFileSync(TRADES_FILE, JSON.stringify([], null, 2));
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  category: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  accountSize: number;
  riskPercentage: number;
  riskAmount: number;
  lotSize: number;
  profitPips: number;
  lossPips: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  tradeDirection: 'LONG' | 'SHORT';
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
  notes?: string;
  tags?: string[];
  entryImage?: string;
  exitImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User operations
export const userStorage = {
  async findByEmail(email: string): Promise<User | null> {
    const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id: string): Promise<User | null> {
    const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return users.find(user => user.id === id) || null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const newUser: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return newUser;
  },

  async updateLastLogin(id: string): Promise<void> {
    const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date();
      users[userIndex].updatedAt = new Date();
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  }
};

// Trade operations
export const tradeStorage = {
  async findByUserId(userId: string): Promise<Trade[]> {
    const trades: Trade[] = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
    return trades.filter(trade => trade.userId === userId);
  },

  async findById(id: string): Promise<Trade | null> {
    const trades: Trade[] = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
    return trades.find(trade => trade.id === id) || null;
  },

  async create(tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trade> {
    const trades: Trade[] = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    trades.push(newTrade);
    fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
    return newTrade;
  },

  async update(id: string, updateData: Partial<Omit<Trade, 'id' | 'createdAt'>>): Promise<Trade | null> {
    const trades: Trade[] = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
    const tradeIndex = trades.findIndex(trade => trade.id === id);
    if (tradeIndex !== -1) {
      trades[tradeIndex] = {
        ...trades[tradeIndex],
        ...updateData,
        updatedAt: new Date(),
      };
      fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
      return trades[tradeIndex];
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    const trades: Trade[] = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
    const tradeIndex = trades.findIndex(trade => trade.id === id);
    if (tradeIndex !== -1) {
      trades.splice(tradeIndex, 1);
      fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
      return true;
    }
    return false;
  }
};
