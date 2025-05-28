# Trading Calculator

A comprehensive forex trading calculator built with Next.js and Tailwind CSS. This tool helps traders calculate position sizes, risk amounts, and potential profit/loss scenarios for forex trades.

## Features

### 📊 Core Calculations
- **Account Size Management**: Input your total account balance
- **Risk Percentage**: Set your risk per trade (recommended 1-3%)
- **Position Size Calculation**: Automatically calculates optimal lot size
- **Risk:Reward Ratio**: Shows the risk-to-reward ratio with visual indicators

### 💱 Trading Pairs
Supports 24+ major forex pairs including:
- Major pairs: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD
- Cross pairs: EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY, and many more

### 📈 Trade Analysis
- **Trade Direction**: Automatically detects long/short positions
- **Pip Calculations**: Accurate pip calculations for all currency pairs
- **Profit/Loss Scenarios**: Shows potential outcomes for both winning and losing trades
- **Visual Indicators**: Color-coded results for easy interpretation

### 🎯 Risk Management
- **Built-in Validation**: Ensures stop loss levels make sense for trade direction
- **Risk Management Tips**: Educational content about proper risk management
- **Visual Feedback**: Color-coded risk:reward ratios (Green: Excellent, Yellow: Acceptable, Red: Poor)

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nexjou-tailwind
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Set Account Parameters**:
   - Enter your account size in USD
   - Set your risk percentage (1-3% recommended)

2. **Choose Trading Pair**:
   - Select from 24+ available forex pairs
   - The calculator automatically handles different pip values

3. **Enter Trade Details**:
   - Entry Price: Your planned entry point
   - Exit Price: Your take profit target
   - Stop Loss: Your risk management level

4. **Review Results**:
   - Check the calculated position size
   - Review risk:reward ratio
   - Analyze potential profit/loss scenarios

## Technology Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript
- **UI**: Responsive design with dark mode support

## Risk Management Guidelines

- Never risk more than 1-3% of your account per trade
- Aim for a minimum 1:2 risk-to-reward ratio
- Always use stop losses to limit potential losses
- Consider market volatility when setting position sizes
- Keep a trading journal to track your performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This calculator is for educational purposes only. Trading forex involves substantial risk and may not be suitable for all investors. Always consult with a qualified financial advisor before making trading decisions.
