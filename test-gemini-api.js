// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test Google Gemini API functionality
async function testGeminiAPI() {
  console.log('🧪 Testing Google Gemini API Integration...\n');

  // Check for API key
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_GEMINI_API_KEY not found in environment variables');
    console.log('💡 To fix this:');
    console.log('1. Create a .env.local file in your project root');
    console.log('2. Add your Gemini API key: GOOGLE_GEMINI_API_KEY=your_api_key_here');
    console.log('3. Get your API key from: https://makersuite.google.com/app/apikey');
    return false;
  }

  console.log('✅ API Key found in environment variables');
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized successfully');

    // Test different models
    const modelsToTest = [
      'gemini-1.5-flash'
    ];

    for (const modelName of modelsToTest) {
      console.log(`\n🔍 Testing model: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Simple test prompt
        const testPrompt = `"Generate a comprehensive Forex trading analysis report for the selected currency pair (e.g., EUR/USD) for today. The report should be in JSON format and include the following details:

Name of the currency pair

Trading volume for today

Relevant news (past or upcoming) related to the pair

Forecast for today

Analysis indicating whether the market is bullish or bearish

AI-driven insights, including:

Sentiment analysis for the currency pair

Key technical indicators (e.g., RSI, MACD)

Potential support and resistance levels

Historical performance insights

Only return the data in JSON format, with no additional text."`;

        console.log(`⏳ Sending test prompt to ${modelName}...`);
        
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const text = await response.text();
        console.log('🛠️ Raw API response:', text);
      } catch (modelError) {
        console.error(`❌ Error with model ${modelName}:`, modelError.message);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 The API key appears to be invalid. Please check:');
      console.log('1. Your API key is correct');
      console.log('2. The API key has proper permissions');
      console.log('3. Billing is enabled for your Google Cloud project');
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Permission denied. Please check:');
      console.log('1. Generative AI API is enabled in Google Cloud Console');
      console.log('2. Your API key has access to Generative AI services');
    }
    
    return false;
  }
}

// Test the existing API route
async function testAPIRoute() {
  console.log('\n🌐 Testing existing API route: /api/ai/suggestions...');
  
  try {
    const testData = {
      strategy: {
        name: "Test Strategy",
        marketType: "Forex",
        tradingStyle: "Scalping",
        timeframe: "5m",
        maxRisk: "2",
        winRate: "65",
        profitTarget: "1:2",
        setupConditions: "RSI oversold + support level",
        entryRules: "Price bounce from support",
        exitRules: "Take profit at resistance",
        indicators: "RSI, Support/Resistance"
      },
      marketConditions: {
        trend: "Bullish",
        volatility: "Medium",
        volume: "High"
      }
    };

    console.log('⏳ Making request to /api/ai/suggestions...');
    
    const response = await fetch('http://localhost:3004/api/ai/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API route responded successfully');
      console.log(`📊 Received ${result.suggestions?.length || 0} suggestions`);
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`📝 First suggestion: ${result.suggestions[0].title}`);
      }
    } else {
      console.error(`❌ API route returned status: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Error response: ${errorText}`);
    }

  } catch (fetchError) {
    console.error('❌ Error testing API route:', fetchError.message);
    console.log('💡 Make sure your Next.js development server is running on port 3004');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Gemini API Test Suite\n');
  console.log('=' .repeat(50));
  
  // Test 1: Direct API access
  const directTest = await testGeminiAPI();
  
  console.log('\n' + '=' .repeat(50));
  
  // Test 2: API route (only if direct test passes)
  if (directTest) {
    await testAPIRoute();
  } else {
    console.log('⏭️ Skipping API route test due to direct API failure');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Test suite completed');
  
  if (!directTest) {
    console.log('\n💡 Next steps:');
    console.log('1. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Create .env.local file with: GOOGLE_GEMINI_API_KEY=your_key');
    console.log('3. Run this test again: node test-gemini-api.js');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

// Run the tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
}); 