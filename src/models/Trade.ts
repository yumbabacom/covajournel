import mongoose, { Schema, Document } from 'mongoose';

// Interface for main dashboard trades
export interface IMainTrade {
  symbol: string;
  status: 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS';
  tradeDirection: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit?: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  positionSize?: number;
  riskAmount?: number;
  category: string;
  tags: string[];
  notes?: string;
  images?: string[];
  strategyId?: string;
  accountSize?: number;
  riskPercentage?: number;
}

// Interface for AM trader trades
export interface IAMTrade {
  dateTime: string;
  weekend: string;
  week: string;
  month: string;
  quarter: string;
  year: string;
  market: string;
  setup: string;
  htfFramework: string;
  dailyProfile: string;
  entryCandle: string;
  entryTime: string;
  entryTimeFrame: string;
  entryConfluence: string[];
  duration: string;
  riskPercent: string;
  plannedRR: string;
  realizedRR?: string;
  comment?: string;
}

// Combined trade interface
export interface ITrade extends Document {
  userId?: string;
  accountId: string;
  context: 'main' | 'am-trader';
  
  // Main trade fields (when context is 'main')
  symbol?: string;
  status?: 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS';
  tradeDirection?: 'LONG' | 'SHORT';
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  profitDollars?: number;
  lossDollars?: number;
  riskRewardRatio?: number;
  positionSize?: number;
  riskAmount?: number;
  category?: string;
  tags?: string[];
  notes?: string;
  images?: string[];
  strategyId?: string;
  accountSize?: number;
  riskPercentage?: number;
  
  // AM trader fields (when context is 'am-trader')
  dateTime?: string;
  weekend?: string;
  week?: string;
  month?: string;
  quarter?: string;
  year?: string;
  market?: string;
  setup?: string;
  htfFramework?: string;
  dailyProfile?: string;
  entryCandle?: string;
  entryTime?: string;
  entryTimeFrame?: string;
  entryConfluence?: string[];
  duration?: string;
  riskPercent?: string;
  plannedRR?: string;
  realizedRR?: string;
  comment?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema: Schema = new Schema({
  userId: {
    type: String,
    index: true
  },
  accountId: {
    type: String,
    required: true,
    index: true
  },
  context: {
    type: String,
    enum: ['main', 'am-trader'],
    required: true,
    index: true
  },
  
  // Main trade fields
  symbol: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['PLANNED', 'ACTIVE', 'WIN', 'LOSS']
  },
  tradeDirection: {
    type: String,
    enum: ['LONG', 'SHORT']
  },
  entryPrice: {
    type: Number
  },
  exitPrice: {
    type: Number
  },
  stopLoss: {
    type: Number
  },
  takeProfit: {
    type: Number
  },
  profitDollars: {
    type: Number
  },
  lossDollars: {
    type: Number
  },
  riskRewardRatio: {
    type: Number
  },
  positionSize: {
    type: Number
  },
  riskAmount: {
    type: Number
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  strategyId: {
    type: String
  },
  accountSize: {
    type: Number
  },
  riskPercentage: {
    type: Number
  },
  
  // AM trader fields
  dateTime: {
    type: String
  },
  weekend: {
    type: String,
    trim: true
  },
  week: {
    type: String,
    trim: true
  },
  month: {
    type: String,
    trim: true
  },
  quarter: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  market: {
    type: String,
    trim: true
  },
  setup: {
    type: String,
    trim: true
  },
  htfFramework: {
    type: String,
    trim: true
  },
  dailyProfile: {
    type: String,
    trim: true
  },
  entryCandle: {
    type: String,
    trim: true
  },
  entryTime: {
    type: String,
    trim: true
  },
  entryTimeFrame: {
    type: String,
    trim: true
  },
  entryConfluence: [{
    type: String,
    trim: true
  }],
  duration: {
    type: String,
    trim: true
  },
  riskPercent: {
    type: String,
    trim: true
  },
  plannedRR: {
    type: String,
    trim: true
  },
  realizedRR: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'trades' // Explicitly set collection name
});

// Create compound indexes for efficient queries
TradeSchema.index({ accountId: 1, context: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, context: 1, createdAt: -1 });
TradeSchema.index({ accountId: 1, context: 1, status: 1 });

// Force the model to use the correct database and collection
const Trade = mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema, 'trades');

export default Trade; 