# MOTRA ICO DApp Setup Guide

## Prerequisites

1. Node.js (v16 or higher)
2. A Thirdweb account and client ID
3. Deployed MotraPresale smart contract on Sepolia testnet

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here
VITE_CHAIN_ID=8453
```

### 3. Update Contract Configuration
The contract ABI is already included in `src/config/thirdweb.js`. You just need to update your contract address in the `.env` file.

### 4. Get Thirdweb Client ID
1. Visit [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project or use existing one
3. Copy your Client ID
4. Update the `VITE_THIRDWEB_CLIENT_ID` in your `.env` file

### 5. Deploy Smart Contract
Make sure your MotraPresale contract is deployed on Base mainnet with:
- Token address set via `updateToken()`
- Token price set via `updateTokenPresalePrice()`
- Sufficient tokens in the contract for sale

### 6. Run the Application
```bash
npm run dev
```

## Features

- **Wallet Connection**: Connect with MetaMask, Coinbase Wallet, Binance Wallet, and Trust Wallet
- **Token Purchase**: Buy MOTRA tokens with ETH
- **Payment Options**: Support for both crypto and fiat payments via Thirdweb Universal Bridge
- **ICO Stats**: Real-time display of ICO progress and token information
- **Responsive Design**: Clean white and blue themed UI that works on all devices

## Smart Contract Functions Used

- `getTokenInfo()`: Retrieves token information including name, symbol, price, and available tokens
- `buyToken(uint256 _buyAmount)`: Purchase tokens with ETH
- `totalSoldTokens()`: Get total tokens sold so far

## Payment Methods Supported

1. **Crypto Payments**: Direct ETH payments from connected wallet
2. **Fiat Payments**: Credit cards, bank transfers, and stablecoins via Thirdweb Universal Bridge

## Troubleshooting

- Ensure you're connected to Base mainnet
- Make sure you have sufficient ETH for gas fees
- Verify contract address is correct in the configuration
- Check that the smart contract has tokens available for sale

## Base Chain Benefits

- **Lower Gas Fees**: Much cheaper transactions than Ethereum mainnet
- **Payment Widget Support**: Full support for fiat payments via Thirdweb
- **Fast Transactions**: Quick confirmation times
- **Coinbase Integration**: Native integration with Coinbase ecosystem
