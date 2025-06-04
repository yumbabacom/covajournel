// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-journal';

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('tradingcalc');
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@tradingjournal.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@tradingjournal.com');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      name: 'Admin User',
      email: 'admin@tradingjournal.com',
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@tradingjournal.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', result.insertedId.toString());
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdmin().catch(console.error);
