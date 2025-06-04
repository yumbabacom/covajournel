import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  userId: string;
  accountId: string;
  title: string;
  content: string;
  mood: string;
  confidence: number;
  tags: string[];
  marketCondition?: string;
  lessons?: string;
  goals?: string;
  images: string[];
  trades: string[];
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  accountId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['excited', 'confident', 'calm', 'neutral', 'anxious', 'frustrated', 'disappointed'],
    default: 'neutral'
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  tags: [{
    type: String,
    trim: true
  }],
  marketCondition: {
    type: String,
    enum: ['trending', 'ranging', 'volatile', 'quiet', 'news-driven']
  },
  lessons: {
    type: String,
    trim: true
  },
  goals: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  trades: [{
    type: String
  }],
  date: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
JournalEntrySchema.index({ userId: 1, accountId: 1, date: -1 });

export default mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema); 