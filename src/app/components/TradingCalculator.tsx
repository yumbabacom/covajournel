'use client';

import { useState, useEffect } from 'react';

interface TradingPair {
  symbol: string;
  name: string;
  category: 'Forex' | 'Commodities' | 'Stocks' | 'Indices' | 'Crypto';
  pipValue: number; // Value of 1 pip for 1 standard lot
  pipSize: number; // Size of 1 pip (0.0001 for most forex, 0.01 for JPY pairs, 1 for stocks, etc.)
  contractSize: number; // Standard contract/lot size
}

const tradingPairs: TradingPair[] = [
  // Major Forex Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },

  // Minor Forex Pairs
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/CAD', name: 'British Pound / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'NZD/CAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'CAD/CHF', name: 'Canadian Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'NZD/CHF', name: 'New Zealand Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'GBP/NZD', name: 'British Pound / New Zealand Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/NZD', name: 'Euro / New Zealand Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/NZD', name: 'Australian Dollar / New Zealand Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },

  // Exotic Forex Pairs
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/PLN', name: 'US Dollar / Polish Zloty', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/CZK', name: 'US Dollar / Czech Koruna', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/HUF', name: 'US Dollar / Hungarian Forint', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/CNH', name: 'US Dollar / Chinese Yuan Offshore', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },

  // Commodities - Metals
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'Commodities', pipValue: 0.1, pipSize: 0.1, contractSize: 1 },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', category: 'Commodities', pipValue: 5, pipSize: 0.01, contractSize: 5000 },
  { symbol: 'XPT/USD', name: 'Platinum / US Dollar', category: 'Commodities', pipValue: 1, pipSize: 0.1, contractSize: 50 },
  { symbol: 'XPD/USD', name: 'Palladium / US Dollar', category: 'Commodities', pipValue: 1, pipSize: 0.1, contractSize: 100 },
  { symbol: 'XCU/USD', name: 'Copper / US Dollar', category: 'Commodities', pipValue: 25, pipSize: 0.0001, contractSize: 25000 },

  // Commodities - Energy
  { symbol: 'WTI/USD', name: 'West Texas Intermediate Oil', category: 'Commodities', pipValue: 10, pipSize: 0.01, contractSize: 1000 },
  { symbol: 'BRENT/USD', name: 'Brent Crude Oil', category: 'Commodities', pipValue: 10, pipSize: 0.01, contractSize: 1000 },
  { symbol: 'NGAS/USD', name: 'Natural Gas', category: 'Commodities', pipValue: 10, pipSize: 0.001, contractSize: 10000 },

  // Commodities - Agriculture
  { symbol: 'WHEAT/USD', name: 'Wheat', category: 'Commodities', pipValue: 12.5, pipSize: 0.25, contractSize: 5000 },
  { symbol: 'CORN/USD', name: 'Corn', category: 'Commodities', pipValue: 12.5, pipSize: 0.25, contractSize: 5000 },
  { symbol: 'SOYBEAN/USD', name: 'Soybeans', category: 'Commodities', pipValue: 12.5, pipSize: 0.25, contractSize: 5000 },
  { symbol: 'SUGAR/USD', name: 'Sugar', category: 'Commodities', pipValue: 11.2, pipSize: 0.01, contractSize: 112000 },
  { symbol: 'COFFEE/USD', name: 'Coffee', category: 'Commodities', pipValue: 3.75, pipSize: 0.05, contractSize: 37500 },
  { symbol: 'COCOA/USD', name: 'Cocoa', category: 'Commodities', pipValue: 10, pipSize: 1, contractSize: 10 },
  { symbol: 'COTTON/USD', name: 'Cotton', category: 'Commodities', pipValue: 5, pipSize: 0.01, contractSize: 50000 },

  // Major US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ORCL', name: 'Oracle Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'DIS', name: 'The Walt Disney Company', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ZOOM', name: 'Zoom Video Communications', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'SQ', name: 'Block Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'SHOP', name: 'Shopify Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Banking & Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'BAC', name: 'Bank of America Corp.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'WFC', name: 'Wells Fargo & Company', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'MS', name: 'Morgan Stanley', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'V', name: 'Visa Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'MA', name: 'Mastercard Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Healthcare & Pharma
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'PFE', name: 'Pfizer Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'MRNA', name: 'Moderna Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'Indices', pipValue: 25, pipSize: 0.25, contractSize: 50 },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', category: 'Indices', pipValue: 20, pipSize: 0.25, contractSize: 20 },
  { symbol: 'DJI30', name: 'Dow Jones Industrial Average', category: 'Indices', pipValue: 5, pipSize: 1, contractSize: 5 },
  { symbol: 'UK100', name: 'FTSE 100 Index', category: 'Indices', pipValue: 10, pipSize: 0.5, contractSize: 10 },
  { symbol: 'GER40', name: 'DAX 40 Index', category: 'Indices', pipValue: 25, pipSize: 0.5, contractSize: 25 },
  { symbol: 'FRA40', name: 'CAC 40 Index', category: 'Indices', pipValue: 10, pipSize: 0.5, contractSize: 10 },
  { symbol: 'JPN225', name: 'Nikkei 225 Index', category: 'Indices', pipValue: 5, pipSize: 5, contractSize: 5 },
  { symbol: 'AUS200', name: 'ASX 200 Index', category: 'Indices', pipValue: 25, pipSize: 1, contractSize: 25 },
  { symbol: 'HK50', name: 'Hang Seng Index', category: 'Indices', pipValue: 10, pipSize: 1, contractSize: 10 },

  // Cryptocurrencies
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 1, contractSize: 1 },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.0001, contractSize: 1 },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.0001, contractSize: 1 },
  { symbol: 'DOT/USD', name: 'Polkadot / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
  { symbol: 'LINK/USD', name: 'Chainlink / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
  { symbol: 'BCH/USD', name: 'Bitcoin Cash / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'BNB/USD', name: 'Binance Coin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
];

interface User {
  id: string;
  email: string;
  name: string;
}

interface TradingCalculatorProps {
  user?: User | null;
  onSaveTrade?: (tradeData: any) => void;
  onCalculationComplete?: (data: any) => void;
  showSaveButton?: boolean;
}

export default function TradingCalculator({
  user,
  onSaveTrade,
  onCalculationComplete,
  showSaveButton = true
}: TradingCalculatorProps) {
  const [accountSize, setAccountSize] = useState<string>('10000');
  const [riskPercentage, setRiskPercentage] = useState<string>('2');
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [entryPrice, setEntryPrice] = useState<string>('1.1000');
  const [exitPrice, setExitPrice] = useState<string>('1.1100');
  const [stopLoss, setStopLoss] = useState<string>('1.0950');

  // Modal and search states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Calculated values
  const [riskAmount, setRiskAmount] = useState<number>(0);
  const [lotSize, setLotSize] = useState<number>(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(0);
  const [profitPips, setProfitPips] = useState<number>(0);
  const [lossPips, setLossPips] = useState<number>(0);
  const [profitDollars, setProfitDollars] = useState<number>(0);
  const [lossDollars, setLossDollars] = useState<number>(0);

  useEffect(() => {
    calculateValues();
  }, [accountSize, riskPercentage, selectedPair, entryPrice, exitPrice, stopLoss]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Filter trading pairs based on search and category
  const filteredPairs = tradingPairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pair.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pair.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter buttons
  const categories = ['All', ...Array.from(new Set(tradingPairs.map(pair => pair.category)))];

  // Handle pair selection
  const handlePairSelect = (symbol: string) => {
    setSelectedPair(symbol);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Forex':
        return '💱';
      case 'Commodities':
        return '🥇';
      case 'Stocks':
        return '📈';
      case 'Indices':
        return '📊';
      case 'Crypto':
        return '₿';
      default:
        return '🌐';
    }
  };

  const calculateValues = () => {
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercentage) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;



    // Calculate risk amount first (this should always work if account and risk are valid)
    if (account > 0 && risk > 0) {
      const riskAmt = (account * risk) / 100;
      setRiskAmount(riskAmt);
    } else {
      setRiskAmount(0);
    }

    // If any price inputs are missing or invalid, reset calculations but keep risk amount
    if (entry <= 0 || exit <= 0 || stop <= 0) {
      setLotSize(0);
      setRiskRewardRatio(0);
      setProfitPips(0);
      setLossPips(0);
      setProfitDollars(0);
      setLossDollars(0);
      return;
    }

    // Get selected pair data
    const selectedPairData = tradingPairs.find(pair => pair.symbol === selectedPair);
    if (!selectedPairData) {
      setLotSize(0);
      setRiskRewardRatio(0);
      setProfitPips(0);
      setLossPips(0);
      setProfitDollars(0);
      setLossDollars(0);
      return;
    }

    const { pipValue, pipSize, contractSize } = selectedPairData;

    // Calculate pips based on the specific instrument's pip size
    const stopLossPips = Math.abs(entry - stop) / pipSize;
    const profitPipsCalc = Math.abs(exit - entry) / pipSize;

    setProfitPips(profitPipsCalc);
    setLossPips(stopLossPips);

    // Calculate risk:reward ratio
    if (stopLossPips > 0) {
      const rrRatio = profitPipsCalc / stopLossPips;
      setRiskRewardRatio(rrRatio);
    } else {
      setRiskRewardRatio(0);
    }

    // Calculate position size based on risk
    const riskAmt = (account * risk) / 100;
    if (stopLossPips > 0 && riskAmt > 0) {
      // For different instrument types, calculate position size differently
      let positionSize = 0;
      let profitDollarsCalc = 0;
      let lossDollarsCalc = 0;

      if (selectedPairData.category === 'Forex') {
        // Forex: Position size in lots
        positionSize = riskAmt / (stopLossPips * pipValue);
        profitDollarsCalc = profitPipsCalc * pipValue * positionSize;
        lossDollarsCalc = stopLossPips * pipValue * positionSize;
      } else if (selectedPairData.category === 'Stocks') {
        // Stocks: Position size in shares
        const stopLossDistance = Math.abs(entry - stop);
        positionSize = riskAmt / stopLossDistance;
        profitDollarsCalc = Math.abs(exit - entry) * positionSize;
        lossDollarsCalc = stopLossDistance * positionSize;
      } else if (selectedPairData.category === 'Indices') {
        // Indices: Position size in contracts
        positionSize = riskAmt / (stopLossPips * pipValue);
        profitDollarsCalc = profitPipsCalc * pipValue * positionSize;
        lossDollarsCalc = stopLossPips * pipValue * positionSize;
      } else if (selectedPairData.category === 'Commodities') {
        // Commodities: Position size in contracts
        positionSize = riskAmt / (stopLossPips * pipValue);
        profitDollarsCalc = profitPipsCalc * pipValue * positionSize;
        lossDollarsCalc = stopLossPips * pipValue * positionSize;
      } else if (selectedPairData.category === 'Crypto') {
        // Crypto: Position size in coins/tokens
        const stopLossDistance = Math.abs(entry - stop);
        positionSize = riskAmt / stopLossDistance;
        profitDollarsCalc = Math.abs(exit - entry) * positionSize;
        lossDollarsCalc = stopLossDistance * positionSize;
      }

      setLotSize(positionSize);
      setProfitDollars(profitDollarsCalc);
      setLossDollars(lossDollarsCalc);

      // Call the calculation complete callback if provided
      if (onCalculationComplete) {
        const tradeDirection = parseFloat(exitPrice) > parseFloat(entryPrice) ? 'LONG' : 'SHORT';
        const currentRiskRewardRatio = stopLossPips > 0 ? profitPipsCalc / stopLossPips : 0;
        onCalculationComplete({
          symbol: selectedPair,
          category: selectedPairData.category,
          entryPrice: parseFloat(entryPrice),
          exitPrice: parseFloat(exitPrice),
          stopLoss: parseFloat(stopLoss),
          accountSize: parseFloat(accountSize),
          riskPercentage: parseFloat(riskPercentage),
          riskAmount: riskAmt,
          positionSize: positionSize,
          profitPips: profitPipsCalc,
          lossPips: stopLossPips,
          profitDollars: profitDollarsCalc,
          lossDollars: lossDollarsCalc,
          riskRewardRatio: currentRiskRewardRatio,
          tradeDirection: tradeDirection,
        });
      }
    } else {
      setLotSize(0);
      setProfitDollars(0);
      setLossDollars(0);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl blur-xl"></div>

      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 lg:p-12 transition-all duration-500 hover:shadow-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3">
            Professional Trading Calculator
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Calculate your position size, risk, and potential returns with precision
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Input Section */}
        <div className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-white/30 dark:border-gray-700/30">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Trading Parameters
                </h3>
              </div>

              <div className="space-y-6">

              {/* Account Size */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                  <span>Account Size ($)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">$</span>
                  </div>
                  <input
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 text-lg font-medium backdrop-blur-sm"
                    placeholder="10000"
                  />
                </div>
              </div>

              {/* Risk Percentage */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm"></div>
                  <span>Risk Percentage (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(e.target.value)}
                    className="w-full px-4 py-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 dark:text-white transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 text-lg font-medium backdrop-blur-sm"
                    placeholder="2"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">%</span>
                  </div>
                </div>
              </div>

          {/* Trading Pair */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span>Trading Pair</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 backdrop-blur-sm text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getCategoryIcon(tradingPairs.find(p => p.symbol === selectedPair)?.category || 'Forex')}</span>
                  <div>
                    <div className="font-semibold">{selectedPair}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tradingPairs.find(p => p.symbol === selectedPair)?.name}
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Entry Price */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Entry Price</span>
            </label>
            <input
              type="number"
              step="0.00001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 backdrop-blur-sm"
              placeholder="1.1000"
            />
          </div>

          {/* Exit Price */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Exit Price (Take Profit)</span>
            </label>
            <input
              type="number"
              step="0.00001"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 backdrop-blur-sm"
              placeholder="1.1100"
            />
          </div>

              {/* Stop Loss */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
                  <span>Stop Loss</span>
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-4 py-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 dark:text-white transition-all duration-300 hover:shadow-md hover:border-red-300 dark:hover:border-red-600 text-lg font-medium backdrop-blur-sm"
                  placeholder="1.0950"
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-white/30 dark:border-gray-700/30 space-y-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Calculated Results
              </h3>
            </div>

          {/* Trade Direction Indicator */}
          {parseFloat(entryPrice) > 0 && parseFloat(exitPrice) > 0 && (
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${parseFloat(exitPrice) > parseFloat(entryPrice)
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-green-100 dark:shadow-green-900/20'
              : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20'} shadow-lg`}>
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${parseFloat(exitPrice) > parseFloat(entryPrice) ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-lg font-bold ${parseFloat(exitPrice) > parseFloat(entryPrice)
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'}`}>
                  {parseFloat(exitPrice) > parseFloat(entryPrice) ? '📈 LONG POSITION' : '📉 SHORT POSITION'}
                </span>
              </div>
            </div>
          )}

          {/* Auto-calculated values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Risk Amount</span>
                </h3>
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                ${riskAmount.toFixed(2)}
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Position Size</span>
                </h3>
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {lotSize.toFixed(4)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {(() => {
                  const selectedPairData = tradingPairs.find(p => p.symbol === selectedPair);
                  if (!selectedPairData) return 'units';
                  switch (selectedPairData.category) {
                    case 'Forex': return 'lots';
                    case 'Stocks': return 'shares';
                    case 'Indices': return 'contracts';
                    case 'Commodities': return 'contracts';
                    case 'Crypto': return 'coins';
                    default: return 'units';
                  }
                })()}
              </p>
            </div>

            <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sm:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Risk:Reward Ratio</span>
                </h3>
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className={`text-3xl font-bold ${riskRewardRatio >= 2 ? 'text-green-600 dark:text-green-400' : riskRewardRatio >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  1:{riskRewardRatio.toFixed(2)}
                </p>
                <div className="flex-1">
                  {riskRewardRatio >= 2 && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✅ Excellent</span>}
                  {riskRewardRatio >= 1 && riskRewardRatio < 2 && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">⚠️ Acceptable</span>}
                  {riskRewardRatio < 1 && riskRewardRatio > 0 && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">❌ Poor</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Win/Loss Scenarios */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span>Profit/Loss Scenarios</span>
            </h3>

            {/* Win Scenario */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h4 className="text-xl font-bold text-green-800 dark:text-green-300">
                  If Trade Wins
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Profit Pips</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {profitPips.toFixed(1)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">pips</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Profit Amount</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${profitDollars.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">USD</p>
                </div>
              </div>
            </div>

            {/* Loss Scenario */}
            <div className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-2xl border border-red-200/50 dark:border-red-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📉</span>
                </div>
                <h4 className="text-xl font-bold text-red-800 dark:text-red-300">
                  If Trade Loses
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Loss Pips</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {lossPips.toFixed(1)}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">pips</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Loss Amount</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    ${lossDollars.toFixed(2)}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">USD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Trading Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Account Size:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">${parseFloat(accountSize || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Risk per Trade:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{riskPercentage}% (${riskAmount.toFixed(2)})</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Position Size:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {lotSize.toFixed(4)} {(() => {
                    const selectedPairData = tradingPairs.find(p => p.symbol === selectedPair);
                    if (!selectedPairData) return 'units';
                    switch (selectedPairData.category) {
                      case 'Forex': return 'lots';
                      case 'Stocks': return 'shares';
                      case 'Indices': return 'contracts';
                      case 'Commodities': return 'contracts';
                      case 'Crypto': return 'coins';
                      default: return 'units';
                    }
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Risk:Reward:</span>
                <span className={`font-bold text-lg ${riskRewardRatio >= 2 ? 'text-green-600 dark:text-green-400' : riskRewardRatio >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  1:{riskRewardRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Save Trade Button */}
          {user && onSaveTrade && showSaveButton && (
            <div className="mt-8">
              <button
                onClick={() => {
                  const selectedPairData = tradingPairs.find(p => p.symbol === selectedPair);
                  const tradeDirection = parseFloat(exitPrice) > parseFloat(entryPrice) ? 'LONG' : 'SHORT';

                  const tradeData = {
                    symbol: selectedPair,
                    category: selectedPairData?.category || 'Forex',
                    entryPrice: parseFloat(entryPrice),
                    exitPrice: parseFloat(exitPrice),
                    stopLoss: parseFloat(stopLoss),
                    accountSize: parseFloat(accountSize),
                    riskPercentage: parseFloat(riskPercentage),
                    riskAmount: (parseFloat(accountSize) * parseFloat(riskPercentage)) / 100,
                    positionSize: lotSize,
                    profitPips: profitPips,
                    lossPips: lossPips,
                    profitDollars: profitDollars,
                    lossDollars: lossDollars,
                    riskRewardRatio: riskRewardRatio,
                    tradeDirection: tradeDirection,
                  };

                  onSaveTrade(tradeData);
                }}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save to Trade Journal</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Save Your Calculations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Sign up to save your trade calculations and build a comprehensive trading journal
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Login or Sign Up to access Trade Journal features
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
        </div>
      </div>

      {/* Trading Pair Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Select Trading Pair
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Choose from {tradingPairs.length}+ instruments across all markets
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110 group"
                >
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search instruments by symbol or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative">
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`group relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{getCategoryIcon(category)}</span>
                        <span>{category}</span>
                        {selectedCategory === category && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      {selectedCategory === category && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-20 animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative">
              {/* Results Count */}
              <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {filteredPairs.length} instrument{filteredPairs.length !== 1 ? 's' : ''} found
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Searching for "{searchTerm}"
                    </p>
                  )}
                </div>
              </div>

              {/* Scrollable List */}
              <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {filteredPairs.map((pair, index) => (
                    <button
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair.symbol)}
                      className="w-full p-4 text-left bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm rounded-2xl transition-all duration-300 flex items-center space-x-4 group border border-gray-200/30 dark:border-gray-600/30 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:scale-[1.02] transform"
                      style={{
                        animationName: 'fadeInUp',
                        animationDuration: '0.5s',
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'forwards',
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-2xl">{getCategoryIcon(pair.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {pair.symbol}
                          </div>
                          <div className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full text-gray-600 dark:text-gray-300 font-medium">
                            {pair.category}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {pair.name}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredPairs.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No instruments found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Try adjusting your search terms or selecting a different category
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('All');
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
