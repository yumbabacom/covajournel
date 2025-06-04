'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TradingPair {
  symbol: string;
  name: string;
  category: 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices';
  baseAsset: string;
  quoteAsset: string;
  popular?: boolean;
}

interface TradingPairSelectorProps {
  selectedPair: string;
  onPairSelect: (pair: string) => void;
}

const tradingPairs: TradingPair[] = [
  // Major Forex Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', baseAsset: 'EUR', quoteAsset: 'USD', popular: true },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', baseAsset: 'GBP', quoteAsset: 'USD', popular: true },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', baseAsset: 'USD', quoteAsset: 'JPY', popular: true },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex', baseAsset: 'AUD', quoteAsset: 'USD', popular: true },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', baseAsset: 'USD', quoteAsset: 'CAD' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', baseAsset: 'USD', quoteAsset: 'CHF' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'forex', baseAsset: 'NZD', quoteAsset: 'USD' },
  // Cross Currency Pairs
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'forex', baseAsset: 'EUR', quoteAsset: 'GBP' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'forex', baseAsset: 'EUR', quoteAsset: 'JPY' },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'forex', baseAsset: 'EUR', quoteAsset: 'CHF' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'forex', baseAsset: 'EUR', quoteAsset: 'AUD' },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', category: 'forex', baseAsset: 'EUR', quoteAsset: 'CAD' },
  { symbol: 'EUR/NZD', name: 'Euro / New Zealand Dollar', category: 'forex', baseAsset: 'EUR', quoteAsset: 'NZD' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'forex', baseAsset: 'GBP', quoteAsset: 'JPY' },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc', category: 'forex', baseAsset: 'GBP', quoteAsset: 'CHF' },
  { symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', category: 'forex', baseAsset: 'GBP', quoteAsset: 'AUD' },
  { symbol: 'GBP/CAD', name: 'British Pound / Canadian Dollar', category: 'forex', baseAsset: 'GBP', quoteAsset: 'CAD' },
  { symbol: 'GBP/NZD', name: 'British Pound / New Zealand Dollar', category: 'forex', baseAsset: 'GBP', quoteAsset: 'NZD' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'forex', baseAsset: 'AUD', quoteAsset: 'JPY' },
  { symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', category: 'forex', baseAsset: 'AUD', quoteAsset: 'CHF' },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'forex', baseAsset: 'AUD', quoteAsset: 'CAD' },
  { symbol: 'AUD/NZD', name: 'Australian Dollar / New Zealand Dollar', category: 'forex', baseAsset: 'AUD', quoteAsset: 'NZD' },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'forex', baseAsset: 'CAD', quoteAsset: 'JPY' },
  { symbol: 'CAD/CHF', name: 'Canadian Dollar / Swiss Franc', category: 'forex', baseAsset: 'CAD', quoteAsset: 'CHF' },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', category: 'forex', baseAsset: 'CHF', quoteAsset: 'JPY' },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'forex', baseAsset: 'NZD', quoteAsset: 'JPY' },
  { symbol: 'NZD/CHF', name: 'New Zealand Dollar / Swiss Franc', category: 'forex', baseAsset: 'NZD', quoteAsset: 'CHF' },
  { symbol: 'NZD/CAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'forex', baseAsset: 'NZD', quoteAsset: 'CAD' },

  // Exotic Forex Pairs
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', category: 'forex', baseAsset: 'USD', quoteAsset: 'SEK' },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', category: 'forex', baseAsset: 'USD', quoteAsset: 'NOK' },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', category: 'forex', baseAsset: 'USD', quoteAsset: 'DKK' },
  { symbol: 'USD/PLN', name: 'US Dollar / Polish Zloty', category: 'forex', baseAsset: 'USD', quoteAsset: 'PLN' },
  { symbol: 'USD/CZK', name: 'US Dollar / Czech Koruna', category: 'forex', baseAsset: 'USD', quoteAsset: 'CZK' },
  { symbol: 'USD/HUF', name: 'US Dollar / Hungarian Forint', category: 'forex', baseAsset: 'USD', quoteAsset: 'HUF' },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', category: 'forex', baseAsset: 'USD', quoteAsset: 'TRY' },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', category: 'forex', baseAsset: 'USD', quoteAsset: 'ZAR' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', category: 'forex', baseAsset: 'USD', quoteAsset: 'MXN' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', category: 'forex', baseAsset: 'USD', quoteAsset: 'SGD' },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', category: 'forex', baseAsset: 'USD', quoteAsset: 'HKD' },
  { symbol: 'EUR/SEK', name: 'Euro / Swedish Krona', category: 'forex', baseAsset: 'EUR', quoteAsset: 'SEK' },
  { symbol: 'EUR/NOK', name: 'Euro / Norwegian Krone', category: 'forex', baseAsset: 'EUR', quoteAsset: 'NOK' },
  { symbol: 'EUR/PLN', name: 'Euro / Polish Zloty', category: 'forex', baseAsset: 'EUR', quoteAsset: 'PLN' },
  { symbol: 'EUR/CZK', name: 'Euro / Czech Koruna', category: 'forex', baseAsset: 'EUR', quoteAsset: 'CZK' },
  { symbol: 'EUR/HUF', name: 'Euro / Hungarian Forint', category: 'forex', baseAsset: 'EUR', quoteAsset: 'HUF' },
  { symbol: 'EUR/TRY', name: 'Euro / Turkish Lira', category: 'forex', baseAsset: 'EUR', quoteAsset: 'TRY' },
  { symbol: 'GBP/SEK', name: 'British Pound / Swedish Krona', category: 'forex', baseAsset: 'GBP', quoteAsset: 'SEK' },
  { symbol: 'GBP/NOK', name: 'British Pound / Norwegian Krone', category: 'forex', baseAsset: 'GBP', quoteAsset: 'NOK' },
  { symbol: 'GBP/PLN', name: 'British Pound / Polish Zloty', category: 'forex', baseAsset: 'GBP', quoteAsset: 'PLN' },

  // Major Cryptocurrencies
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'crypto', baseAsset: 'BTC', quoteAsset: 'USD', popular: true },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'crypto', baseAsset: 'ETH', quoteAsset: 'USD', popular: true },
  { symbol: 'BNB/USD', name: 'Binance Coin / US Dollar', category: 'crypto', baseAsset: 'BNB', quoteAsset: 'USD', popular: true },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', category: 'crypto', baseAsset: 'ADA', quoteAsset: 'USD', popular: true },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'crypto', baseAsset: 'SOL', quoteAsset: 'USD', popular: true },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', category: 'crypto', baseAsset: 'XRP', quoteAsset: 'USD', popular: true },
  { symbol: 'DOT/USD', name: 'Polkadot / US Dollar', category: 'crypto', baseAsset: 'DOT', quoteAsset: 'USD' },
  { symbol: 'AVAX/USD', name: 'Avalanche / US Dollar', category: 'crypto', baseAsset: 'AVAX', quoteAsset: 'USD' },
  { symbol: 'MATIC/USD', name: 'Polygon / US Dollar', category: 'crypto', baseAsset: 'MATIC', quoteAsset: 'USD' },
  { symbol: 'LINK/USD', name: 'Chainlink / US Dollar', category: 'crypto', baseAsset: 'LINK', quoteAsset: 'USD' },
  { symbol: 'UNI/USD', name: 'Uniswap / US Dollar', category: 'crypto', baseAsset: 'UNI', quoteAsset: 'USD' },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', category: 'crypto', baseAsset: 'LTC', quoteAsset: 'USD' },
  { symbol: 'BCH/USD', name: 'Bitcoin Cash / US Dollar', category: 'crypto', baseAsset: 'BCH', quoteAsset: 'USD' },
  { symbol: 'DOGE/USD', name: 'Dogecoin / US Dollar', category: 'crypto', baseAsset: 'DOGE', quoteAsset: 'USD' },
  { symbol: 'SHIB/USD', name: 'Shiba Inu / US Dollar', category: 'crypto', baseAsset: 'SHIB', quoteAsset: 'USD' },
  { symbol: 'ATOM/USD', name: 'Cosmos / US Dollar', category: 'crypto', baseAsset: 'ATOM', quoteAsset: 'USD' },
  { symbol: 'ALGO/USD', name: 'Algorand / US Dollar', category: 'crypto', baseAsset: 'ALGO', quoteAsset: 'USD' },
  { symbol: 'VET/USD', name: 'VeChain / US Dollar', category: 'crypto', baseAsset: 'VET', quoteAsset: 'USD' },
  { symbol: 'FTM/USD', name: 'Fantom / US Dollar', category: 'crypto', baseAsset: 'FTM', quoteAsset: 'USD' },
  { symbol: 'NEAR/USD', name: 'NEAR Protocol / US Dollar', category: 'crypto', baseAsset: 'NEAR', quoteAsset: 'USD' },
  { symbol: 'ICP/USD', name: 'Internet Computer / US Dollar', category: 'crypto', baseAsset: 'ICP', quoteAsset: 'USD' },
  { symbol: 'FLOW/USD', name: 'Flow / US Dollar', category: 'crypto', baseAsset: 'FLOW', quoteAsset: 'USD' },
  { symbol: 'SAND/USD', name: 'The Sandbox / US Dollar', category: 'crypto', baseAsset: 'SAND', quoteAsset: 'USD' },
  { symbol: 'MANA/USD', name: 'Decentraland / US Dollar', category: 'crypto', baseAsset: 'MANA', quoteAsset: 'USD' },
  { symbol: 'CRO/USD', name: 'Cronos / US Dollar', category: 'crypto', baseAsset: 'CRO', quoteAsset: 'USD' },
  { symbol: 'FIL/USD', name: 'Filecoin / US Dollar', category: 'crypto', baseAsset: 'FIL', quoteAsset: 'USD' },
  { symbol: 'AAVE/USD', name: 'Aave / US Dollar', category: 'crypto', baseAsset: 'AAVE', quoteAsset: 'USD' },
  { symbol: 'COMP/USD', name: 'Compound / US Dollar', category: 'crypto', baseAsset: 'COMP', quoteAsset: 'USD' },
  { symbol: 'MKR/USD', name: 'Maker / US Dollar', category: 'crypto', baseAsset: 'MKR', quoteAsset: 'USD' },
  { symbol: 'SUSHI/USD', name: 'SushiSwap / US Dollar', category: 'crypto', baseAsset: 'SUSHI', quoteAsset: 'USD' },

  // Popular US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', baseAsset: 'AAPL', quoteAsset: 'USD', popular: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', baseAsset: 'TSLA', quoteAsset: 'USD', popular: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', baseAsset: 'GOOGL', quoteAsset: 'USD', popular: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'stocks', baseAsset: 'MSFT', quoteAsset: 'USD', popular: true },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', baseAsset: 'AMZN', quoteAsset: 'USD', popular: true },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'stocks', baseAsset: 'META', quoteAsset: 'USD', popular: true },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'stocks', baseAsset: 'NVDA', quoteAsset: 'USD', popular: true },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'stocks', baseAsset: 'NFLX', quoteAsset: 'USD' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'stocks', baseAsset: 'AMD', quoteAsset: 'USD' },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'stocks', baseAsset: 'INTC', quoteAsset: 'USD' },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'stocks', baseAsset: 'CRM', quoteAsset: 'USD' },
  { symbol: 'ORCL', name: 'Oracle Corporation', category: 'stocks', baseAsset: 'ORCL', quoteAsset: 'USD' },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'stocks', baseAsset: 'ADBE', quoteAsset: 'USD' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', category: 'stocks', baseAsset: 'PYPL', quoteAsset: 'USD' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', category: 'stocks', baseAsset: 'UBER', quoteAsset: 'USD' },
  { symbol: 'LYFT', name: 'Lyft Inc.', category: 'stocks', baseAsset: 'LYFT', quoteAsset: 'USD' },
  { symbol: 'SPOT', name: 'Spotify Technology SA', category: 'stocks', baseAsset: 'SPOT', quoteAsset: 'USD' },
  { symbol: 'ZOOM', name: 'Zoom Video Communications', category: 'stocks', baseAsset: 'ZOOM', quoteAsset: 'USD' },
  { symbol: 'SHOP', name: 'Shopify Inc.', category: 'stocks', baseAsset: 'SHOP', quoteAsset: 'USD' },
  { symbol: 'SQ', name: 'Block Inc.', category: 'stocks', baseAsset: 'SQ', quoteAsset: 'USD' },
  { symbol: 'TWTR', name: 'Twitter Inc.', category: 'stocks', baseAsset: 'TWTR', quoteAsset: 'USD' },
  { symbol: 'SNAP', name: 'Snap Inc.', category: 'stocks', baseAsset: 'SNAP', quoteAsset: 'USD' },
  { symbol: 'PINS', name: 'Pinterest Inc.', category: 'stocks', baseAsset: 'PINS', quoteAsset: 'USD' },
  { symbol: 'ROKU', name: 'Roku Inc.', category: 'stocks', baseAsset: 'ROKU', quoteAsset: 'USD' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', category: 'stocks', baseAsset: 'COIN', quoteAsset: 'USD' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', category: 'stocks', baseAsset: 'HOOD', quoteAsset: 'USD' },
  { symbol: 'PLTR', name: 'Palantir Technologies', category: 'stocks', baseAsset: 'PLTR', quoteAsset: 'USD' },
  { symbol: 'RBLX', name: 'Roblox Corporation', category: 'stocks', baseAsset: 'RBLX', quoteAsset: 'USD' },
  { symbol: 'UNITY', name: 'Unity Software Inc.', category: 'stocks', baseAsset: 'UNITY', quoteAsset: 'USD' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', category: 'stocks', baseAsset: 'SNOW', quoteAsset: 'USD' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', category: 'stocks', baseAsset: 'CRWD', quoteAsset: 'USD' },
  { symbol: 'ZM', name: 'Zoom Video Communications', category: 'stocks', baseAsset: 'ZM', quoteAsset: 'USD' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', category: 'stocks', baseAsset: 'DOCU', quoteAsset: 'USD' },
  { symbol: 'OKTA', name: 'Okta Inc.', category: 'stocks', baseAsset: 'OKTA', quoteAsset: 'USD' },
  { symbol: 'TWLO', name: 'Twilio Inc.', category: 'stocks', baseAsset: 'TWLO', quoteAsset: 'USD' },
  { symbol: 'DDOG', name: 'Datadog Inc.', category: 'stocks', baseAsset: 'DDOG', quoteAsset: 'USD' },
  { symbol: 'MDB', name: 'MongoDB Inc.', category: 'stocks', baseAsset: 'MDB', quoteAsset: 'USD' },
  { symbol: 'SPLK', name: 'Splunk Inc.', category: 'stocks', baseAsset: 'SPLK', quoteAsset: 'USD' },
  { symbol: 'WDAY', name: 'Workday Inc.', category: 'stocks', baseAsset: 'WDAY', quoteAsset: 'USD' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', category: 'stocks', baseAsset: 'NOW', quoteAsset: 'USD' },
  { symbol: 'TEAM', name: 'Atlassian Corporation', category: 'stocks', baseAsset: 'TEAM', quoteAsset: 'USD' },

  // Commodities
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'commodities', baseAsset: 'XAU', quoteAsset: 'USD', popular: true },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', category: 'commodities', baseAsset: 'XAG', quoteAsset: 'USD', popular: true },
  { symbol: 'OIL/USD', name: 'Crude Oil / US Dollar', category: 'commodities', baseAsset: 'OIL', quoteAsset: 'USD', popular: true },
  { symbol: 'GAS/USD', name: 'Natural Gas / US Dollar', category: 'commodities', baseAsset: 'GAS', quoteAsset: 'USD' },
  { symbol: 'XPT/USD', name: 'Platinum / US Dollar', category: 'commodities', baseAsset: 'XPT', quoteAsset: 'USD' },
  { symbol: 'XPD/USD', name: 'Palladium / US Dollar', category: 'commodities', baseAsset: 'XPD', quoteAsset: 'USD' },
  { symbol: 'COPPER/USD', name: 'Copper / US Dollar', category: 'commodities', baseAsset: 'COPPER', quoteAsset: 'USD' },
  { symbol: 'WHEAT/USD', name: 'Wheat / US Dollar', category: 'commodities', baseAsset: 'WHEAT', quoteAsset: 'USD' },
  { symbol: 'CORN/USD', name: 'Corn / US Dollar', category: 'commodities', baseAsset: 'CORN', quoteAsset: 'USD' },
  { symbol: 'SOYBEAN/USD', name: 'Soybean / US Dollar', category: 'commodities', baseAsset: 'SOYBEAN', quoteAsset: 'USD' },
  { symbol: 'SUGAR/USD', name: 'Sugar / US Dollar', category: 'commodities', baseAsset: 'SUGAR', quoteAsset: 'USD' },
  { symbol: 'COFFEE/USD', name: 'Coffee / US Dollar', category: 'commodities', baseAsset: 'COFFEE', quoteAsset: 'USD' },
  { symbol: 'COCOA/USD', name: 'Cocoa / US Dollar', category: 'commodities', baseAsset: 'COCOA', quoteAsset: 'USD' },
  { symbol: 'COTTON/USD', name: 'Cotton / US Dollar', category: 'commodities', baseAsset: 'COTTON', quoteAsset: 'USD' },

  // Major Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'indices', baseAsset: 'SPX500', quoteAsset: 'USD', popular: true },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', category: 'indices', baseAsset: 'NAS100', quoteAsset: 'USD', popular: true },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'indices', baseAsset: 'US30', quoteAsset: 'USD', popular: true },
  { symbol: 'UK100', name: 'FTSE 100 Index', category: 'indices', baseAsset: 'UK100', quoteAsset: 'GBP' },
  { symbol: 'GER40', name: 'DAX 40 Index', category: 'indices', baseAsset: 'GER40', quoteAsset: 'EUR' },
  { symbol: 'FRA40', name: 'CAC 40 Index', category: 'indices', baseAsset: 'FRA40', quoteAsset: 'EUR' },
  { symbol: 'ESP35', name: 'IBEX 35 Index', category: 'indices', baseAsset: 'ESP35', quoteAsset: 'EUR' },
  { symbol: 'ITA40', name: 'FTSE MIB Index', category: 'indices', baseAsset: 'ITA40', quoteAsset: 'EUR' },
  { symbol: 'JPN225', name: 'Nikkei 225 Index', category: 'indices', baseAsset: 'JPN225', quoteAsset: 'JPY' },
  { symbol: 'AUS200', name: 'ASX 200 Index', category: 'indices', baseAsset: 'AUS200', quoteAsset: 'AUD' },
  { symbol: 'HK50', name: 'Hang Seng Index', category: 'indices', baseAsset: 'HK50', quoteAsset: 'HKD' },
  { symbol: 'CHN50', name: 'China A50 Index', category: 'indices', baseAsset: 'CHN50', quoteAsset: 'CNH' },
  { symbol: 'IND50', name: 'Nifty 50 Index', category: 'indices', baseAsset: 'IND50', quoteAsset: 'INR' },
  { symbol: 'SWI20', name: 'SMI 20 Index', category: 'indices', baseAsset: 'SWI20', quoteAsset: 'CHF' },
  { symbol: 'NLD25', name: 'AEX 25 Index', category: 'indices', baseAsset: 'NLD25', quoteAsset: 'EUR' },
  { symbol: 'SWE30', name: 'OMX Stockholm 30', category: 'indices', baseAsset: 'SWE30', quoteAsset: 'SEK' },
  { symbol: 'NOR25', name: 'OBX 25 Index', category: 'indices', baseAsset: 'NOR25', quoteAsset: 'NOK' },
  { symbol: 'RUS50', name: 'RTS Index', category: 'indices', baseAsset: 'RUS50', quoteAsset: 'RUB' },
  { symbol: 'BRA60', name: 'Bovespa Index', category: 'indices', baseAsset: 'BRA60', quoteAsset: 'BRL' },
  { symbol: 'MEX35', name: 'IPC 35 Index', category: 'indices', baseAsset: 'MEX35', quoteAsset: 'MXN' },
];

const categoryColors = {
  forex: 'from-blue-500 to-cyan-500',
  crypto: 'from-orange-500 to-amber-500',
  stocks: 'from-emerald-500 to-teal-500',
  commodities: 'from-yellow-500 to-orange-500',
  indices: 'from-purple-500 to-indigo-500',
};

const categoryBgColors = {
  forex: 'bg-blue-500/10 border-blue-500/20',
  crypto: 'bg-orange-500/10 border-orange-500/20',
  stocks: 'bg-emerald-500/10 border-emerald-500/20',
  commodities: 'bg-yellow-500/10 border-yellow-500/20',
  indices: 'bg-purple-500/10 border-purple-500/20',
};

const categoryIcons = {
  forex: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  crypto: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  stocks: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  commodities: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  indices: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

// Flag component
const FlagIcon = ({ countryCode, className = "w-6 h-4" }: { countryCode?: string; className?: string }) => {
  if (!countryCode) {
    return <div className={`${className} bg-gray-200 rounded-sm flex items-center justify-center text-xs`}>?</div>;
  }

  const flagStyle = {
    backgroundImage: `url(https://flagcdn.com/w40/${countryCode.toLowerCase()}.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
    borderRadius: '2px',
    border: '1px solid rgba(0,0,0,0.1)'
  };

  return (
    <span
      className={className}
      style={flagStyle}
      title={countryCode.toUpperCase()}
    />
  );
};

// Get country flag for currency codes
const getCurrencyFlag = (currency: string) => {
  const flagMap: { [key: string]: string } = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp', 'CHF': 'ch',
    'CAD': 'ca', 'AUD': 'au', 'NZD': 'nz', 'SEK': 'se', 'NOK': 'no',
    'DKK': 'dk', 'PLN': 'pl', 'CZK': 'cz', 'HUF': 'hu', 'TRY': 'tr',
    'ZAR': 'za', 'MXN': 'mx', 'SGD': 'sg', 'HKD': 'hk', 'CNH': 'cn',
    'CNY': 'cn', 'INR': 'in', 'KRW': 'kr', 'BRL': 'br', 'RUB': 'ru'
  };
  return flagMap[currency.toUpperCase()];
};

// Get asset/company country flag
const getAssetFlag = (symbol: string) => {
  const assetFlagMap: { [key: string]: string } = {
    // US Stocks
    'AAPL': 'us', 'AMZN': 'us', 'GOOGL': 'us', 'META': 'us', 'NFLX': 'us',
    'MSFT': 'us', 'TSLA': 'us', 'NVDA': 'us', 'AMD': 'us', 'INTC': 'us',
    'CRM': 'us', 'ORCL': 'us', 'ADBE': 'us', 'PYPL': 'us', 'UBER': 'us',
    'LYFT': 'us', 'SPOT': 'us', 'ZOOM': 'us', 'SHOP': 'ca', 'SQ': 'us',
    'TWTR': 'us', 'SNAP': 'us', 'PINS': 'us', 'ROKU': 'us', 'COIN': 'us',
    'HOOD': 'us', 'PLTR': 'us', 'RBLX': 'us', 'UNITY': 'us', 'SNOW': 'us',
    'CRWD': 'us', 'ZM': 'us', 'DOCU': 'us', 'OKTA': 'us', 'TWLO': 'us',
    'DDOG': 'us', 'MDB': 'us', 'SPLK': 'us', 'WDAY': 'us', 'NOW': 'us',
    'TEAM': 'au',

    // Indices
    'SPX500': 'us', 'NAS100': 'us', 'US30': 'us', 'UK100': 'gb',
    'GER40': 'de', 'FRA40': 'fr', 'ESP35': 'es', 'ITA40': 'it',
    'JPN225': 'jp', 'AUS200': 'au', 'HK50': 'hk', 'CHN50': 'cn',
    'IND50': 'in', 'SWI20': 'ch', 'NLD25': 'nl', 'SWE30': 'se',
    'NOR25': 'no', 'RUS50': 'ru', 'BRA60': 'br', 'MEX35': 'mx'
  };
  return assetFlagMap[symbol.toUpperCase()];
};

// Get trading pair flags
const getTradingPairFlags = (pair: TradingPair) => {
  if (pair.category === 'forex') {
    // For forex pairs, show both currency flags
    const baseFlag = getCurrencyFlag(pair.baseAsset);
    const quoteFlag = getCurrencyFlag(pair.quoteAsset);
    return {
      primary: baseFlag,
      secondary: quoteFlag,
      display: 'dual' as const
    };
  } else if (pair.category === 'crypto') {
    // For crypto pairs, show crypto symbol and quote currency flag
    const quoteFlag = getCurrencyFlag(pair.quoteAsset);
    return {
      primary: '₿', // Bitcoin symbol as crypto indicator
      secondary: quoteFlag,
      display: 'dual' as const
    };
  } else if (pair.category === 'stocks') {
    // For stocks, show company country flag
    const assetFlag = getAssetFlag(pair.baseAsset);
    return {
      primary: assetFlag,
      secondary: '',
      display: 'single' as const
    };
  } else if (pair.category === 'indices') {
    // For indices, show country flag
    const assetFlag = getAssetFlag(pair.baseAsset);
    return {
      primary: assetFlag,
      secondary: '',
      display: 'single' as const
    };
  } else if (pair.category === 'commodities') {
    // For commodities, show symbols
    const getCommodityIcon = (baseAsset: string) => {
      switch (baseAsset) {
        case 'XAU':
          return (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          );
        case 'XAG':
          return (
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          );
        case 'OIL':
          return (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8v8H6V6z" clipRule="evenodd" />
            </svg>
          );
        case 'GAS':
          return (
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          );
      }
    };
    
    return {
      primary: getCommodityIcon(pair.baseAsset),
      secondary: '',
      display: 'icon' as const
    };
  }

  // Fallback
  return {
    primary: '',
    secondary: '',
    display: 'none' as const
  };
};

export default function TradingPairSelector({ selectedPair, onPairSelect }: TradingPairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownContentRef.current &&
        !dropdownContentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function updatePosition() {
      if (dropdownRef.current && isOpen) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }

    updatePosition();
    
    if (isOpen) {
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const filteredPairs = tradingPairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pair.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pair.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularPairs = filteredPairs.filter(pair => pair.popular);
  const otherPairs = filteredPairs.filter(pair => !pair.popular);

  const handlePairSelect = (symbol: string) => {
    onPairSelect(symbol);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedPairData = tradingPairs.find(pair => pair.symbol === selectedPair);

  return (
    <div className="relative z-[100000]" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center">
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        Trading Pair
      </label>

      {/* Beautiful Selected Pair Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-emerald-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {selectedPairData ? (
              <>
                {/* Display flags for selected pair */}
                <div className="flex items-center space-x-3">
                  {/* Flag display */}
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const flags = getTradingPairFlags(selectedPairData);
                      
                      if (flags.display === 'dual') {
                        return (
                          <div className="flex items-center space-x-1 bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                            {flags.primary === '₿' ? (
                              <span className="text-orange-500 font-bold text-lg">₿</span>
                            ) : (
                              <FlagIcon countryCode={flags.primary} className="w-6 h-4" />
                            )}
                            <span className="text-gray-400 font-bold">/</span>
                            <FlagIcon countryCode={flags.secondary} className="w-6 h-4" />
                          </div>
                        );
                      } else if (flags.display === 'single') {
                        return (
                          <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                            <FlagIcon countryCode={flags.primary} className="w-6 h-4" />
                          </div>
                        );
                      } else if (flags.display === 'icon') {
                        return (
                          <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm flex items-center justify-center">
                            {flags.primary}
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                  </div>
                </div>
                
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">{selectedPairData.symbol}</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{selectedPairData.name}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mt-1 ${categoryBgColors[selectedPairData.category]}`}>
                    <span className="capitalize">{selectedPairData.category}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-gray-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">Select Trading Pair</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Choose from forex, crypto, stocks & more</p>
                  <div className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium mt-1 text-gray-600">
                    <span>Click to browse</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Portal-based Dropdown Panel */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownContentRef}
          className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[500px] overflow-hidden"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999
          }}
        >
          {/* Enhanced Search and Category Filter */}
          <div className="p-6 border-b border-gray-200">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search trading pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
              />
            </div>

            {/* Beautiful Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Markets</span>
              </button>
              {Object.entries(categoryIcons).map(([category, icon]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <div className={selectedCategory === category ? 'text-white' : 'text-gray-700'}>
                    {icon}
                  </div>
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Beautiful Pairs List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {popularPairs.length > 0 && (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Popular Pairs</h3>
                </div>
                <div className="space-y-2">
                  {popularPairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair.symbol)}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 group border border-transparent hover:border-gray-200"
                    >
                      {/* Flag display for each pair */}
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const flags = getTradingPairFlags(pair);
                          
                          if (flags.display === 'dual') {
                            return (
                              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                {flags.primary === '₿' ? (
                                  <span className="text-orange-500 font-bold text-sm">₿</span>
                                ) : (
                                  <FlagIcon countryCode={flags.primary} className="w-5 h-3" />
                                )}
                                <span className="text-gray-400 text-xs">/</span>
                                <FlagIcon countryCode={flags.secondary} className="w-5 h-3" />
                              </div>
                            );
                          } else if (flags.display === 'single') {
                            return (
                              <div className="bg-gray-50 rounded-lg p-1 border border-gray-100">
                                <FlagIcon countryCode={flags.primary} className="w-5 h-3" />
                              </div>
                            );
                          } else if (flags.display === 'icon') {
                            return (
                              <div className="bg-gray-50 rounded-lg p-1 border border-gray-100 flex items-center justify-center">
                                {flags.primary}
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors duration-300">{pair.symbol}</p>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{pair.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-lg"></div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {otherPairs.length > 0 && (
              <div className="p-6">
                {popularPairs.length > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">All Trading Pairs</h3>
                  </div>
                )}
                <div className="space-y-2">
                  {otherPairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair.symbol)}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 rounded-2xl transition-all duration-300 group border border-transparent hover:border-gray-200"
                    >
                      {/* Flag display for each pair */}
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const flags = getTradingPairFlags(pair);
                          
                          if (flags.display === 'dual') {
                            return (
                              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                {flags.primary === '₿' ? (
                                  <span className="text-orange-500 font-bold text-sm">₿</span>
                                ) : (
                                  <FlagIcon countryCode={flags.primary} className="w-5 h-3" />
                                )}
                                <span className="text-gray-400 text-xs">/</span>
                                <FlagIcon countryCode={flags.secondary} className="w-5 h-3" />
                              </div>
                            );
                          } else if (flags.display === 'single') {
                            return (
                              <div className="bg-gray-50 rounded-lg p-1 border border-gray-100">
                                <FlagIcon countryCode={flags.primary} className="w-5 h-3" />
                              </div>
                            );
                          } else if (flags.display === 'icon') {
                            return (
                              <div className="bg-gray-50 rounded-lg p-1 border border-gray-100 flex items-center justify-center">
                                {flags.primary}
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors duration-300">{pair.symbol}</p>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{pair.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredPairs.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">No pairs found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
