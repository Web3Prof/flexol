# Flexol
Flex your Solana journey

## Overview

This project is a Solana-based dashboard application that allows users to track token prices, view wallet balances, and interact with tokens in a customizable, drag-and-drop interface. Users can view real-time token information, calculate their profit and loss (PnL), and interact with items displayed on the dashboard. The application integrates with the Solana blockchain and utilizes Solana wallets, such as Phantom, for authentication and transaction signing.

The app is designed to provide an intuitive and responsive experience for users looking to track their portfolio or interact with their Solana assets. The core features include customizable item elements, wallet connection, and real-time token price updates using the DexScreener API and Helius API.

## Features

- **Wallet Integration**: Connect Solana wallets like Phantom to view wallet balances and perform transactions.
- **Drag-and-Drop UI**: Customize the layout of your dashboard by dragging and dropping token elements on the screen.
- **Real-Time Token Prices**: Automatically fetch and display the latest token prices.
- **PnL Calculation**: Easily calculate the profit and loss (PnL) based on wallet transactions.
- **Token Information**: View token prices, symbol, and image in a user-friendly format.
- **Customizable Dashboard**: Personalize the dashboard with different token elements and layouts.

## Setup

To get started with this project, follow the steps below:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```
### 2. Install dependencies

```bash
npm install
```

### 3. Setup .env

```bash
SOLANA_RPC_URL=<your-solana-rpc-url>
HELIUS_KEY=<your-helius-api-key>
```

### 4. Start development server
You can access in `http://localhost:3000`
```bash
npm run dev
```

## Future Plans
- **More Item Elements**: Additional customizable elements for the dashboard.
- **Enhanced Customization**: Options for changing colors, sizes, and styles.
- **Multi-Wallet Support**: Connect and manage multiple Solana wallets.
- **"Pay Me" Feature**: Generate payment links or QR codes for easy tipping.
- **Reactions**: Add reactions to item elements like thumbs up or stars.

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests.
