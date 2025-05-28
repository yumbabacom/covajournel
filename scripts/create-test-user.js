const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const uri = 'mongodb+srv://tmuneebanjum:rjn4ajv6WxkbR1MF@journel.s0krb3w.mongodb.net/?retryWrites=true&w=majority&appName=journel';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('tradingcalc');
    const usersCollection = db.collection('users');

    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(testUser);
    console.log('Test user created successfully:', result.insertedId);
    console.log('Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await client.close();
  }
}

createTestUser();
