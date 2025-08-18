# 🚀 MOTRA ICO Complete Setup Guide

## 📋 Overview

This guide provides **exact step-by-step instructions** to deploy and configure your MOTRA ICO with the following specifications:

- **Token Name**: MOTRA Token  
- **Symbol**: MOTRA
- **Total Supply**: 1,000,000,000 MOTRA (displays as 10,000,000,000.00)
- **Decimals**: 2 (so 100 base units = 1.00 MOTRA)
- **Presale Amount**: 100,000,000 MOTRA (10% of supply)
- **Price**: $0.01 USD per token
- **Payment Methods**: ETH, USDT, and Fiat (via Thirdweb)

---

## 🛠️ Prerequisites

1. **Node.js** (v16 or higher)
2. **Wallet** with deployment funds
3. **API Keys** (optional for verification)
4. **Base network** access (recommended)

---

## 📁 Project Structure

```
MOTRA---A-Web3-fitness-platform/
├── Contracts/
│   ├── MotraToken.sol          # Token contract (updated)
│   ├── NewContract.sol         # ICO contract  
│   ├── hardhat.config.js       # Hardhat configuration
│   ├── package.json            # Dependencies
│   ├── env-example.txt         # Environment variables template
│   └── scripts/
│       └── deploy.js           # Deployment script
└── Client/ICO/                 # Frontend application
```

---

## 🔧 Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
cd Contracts
npm install
```

### 1.2 Create Environment File

```bash
# Copy the example file
cp env-example.txt .env

# Edit .env file with your details:
PRIVATE_KEY=your_wallet_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_for_verification
```

**⚠️ SECURITY WARNING**: Never commit your `.env` file with real private keys!

---

## 🚀 Step 2: Deploy Contracts

### 2.1 Compile Contracts

```bash
npx hardhat compile
```

### 2.2 Deploy to Base Sepolia (Testnet First)

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 2.3 Deploy to Base Mainnet (Production)

```bash
npx hardhat run scripts/deploy.js --network base
```

### 2.4 Expected Output

```
🚀 Starting MOTRA ICO Deployment...

📋 Step 1: Deploying MOTRA Token...
✅ MOTRA Token deployed to: 0x1234...
   📊 Token Details:
   - Name: MOTRA Token
   - Symbol: MOTRA
   - Decimals: 2
   - Total Supply: 1000000000.00 MOTRA

📋 Step 2: Deploying ICO Contract...
✅ ICO Contract deployed to: 0x5678...

📋 Step 3: Configuring ICO Contract...
   ✅ Token address set
   ✅ Prices set

📋 Step 4: Transferring presale tokens...
   ✅ Presale tokens transferred
   📊 ICO Contract Balance: 100000000.00 MOTRA

📋 Step 5: Activating presale...
   ✅ Presale activated

🎉 DEPLOYMENT COMPLETE!
=====================================
📋 Contract Addresses:
   MOTRA Token: 0x1234...
   ICO Contract: 0x5678...
```

---

## ⚙️ Step 3: Post-Deployment Configuration

### 3.1 Set USDT Address (Enable USDT Payments)

```javascript
// For Base Mainnet
const USDT_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";

// Connect to your deployed contract
const presaleContract = await ethers.getContractAt("MotraPresale", "YOUR_ICO_CONTRACT_ADDRESS");

// Set USDT address
await presaleContract.updateUSDTAddress(USDT_ADDRESS);

// Enable USDT payments
await presaleContract.toggleUSDT();
```

### 3.2 Verify Contracts (Optional but Recommended)

```bash
# Verify Token Contract
npx hardhat verify --network base TOKEN_ADDRESS "DEPLOYER_ADDRESS"

# Verify ICO Contract  
npx hardhat verify --network base ICO_CONTRACT_ADDRESS
```

---

## 🎯 Step 4: Frontend Configuration

### 4.1 Update Environment Variables

```bash
cd Client/ICO
```

Create/update `.env` file:

```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_CONTRACT_ADDRESS=YOUR_ICO_CONTRACT_ADDRESS_FROM_DEPLOYMENT
VITE_CHAIN_ID=8453
```

### 4.2 Install Frontend Dependencies

```bash
npm install
```

### 4.3 Start Development Server

```bash
npm run dev
```

---

## 📊 Step 5: Price Configuration Details

### 5.1 Understanding the Pricing

With **2 decimals**:
- 1.00 MOTRA = 100 base units
- Price: $0.01 USD per MOTRA token

### 5.2 Price Calculations

```javascript
// For $0.01 per token:

// ETH Price (assuming ETH = $3000)
// $0.01 / $3000 = 0.00000333 ETH per token
const ethPrice = ethers.parseEther("0.00000333");

// USDT Price (USDT has 6 decimals)  
// $0.01 = 10000 (with 6 decimals)
const usdtPrice = 10000;
```

### 5.3 Update Prices (If Needed)

```javascript
// Update both prices
await presaleContract.updateTokenPrices(newEthPrice, newUsdtPrice);

// Or update individually
await presaleContract.updateEthPrice(newEthPrice);
await presaleContract.updateUsdtPrice(newUsdtPrice);
```

---

## 🧪 Step 6: Testing Your ICO

### 6.1 Test Purchase with ETH

1. Connect wallet to your frontend
2. Select "ETH Payment"
3. Enter token amount (e.g., 1000 for 1000.00 MOTRA)
4. Confirm transaction

### 6.2 Test Purchase with USDT

1. Ensure you have USDT in your wallet
2. Select "USDT Payment" 
3. Approve USDT spending (if needed)
4. Enter token amount
5. Confirm transaction

### 6.3 Verify Purchases

```javascript
// Check contract token balance
const remaining = await presaleContract.getRemainingTokens();
console.log("Remaining tokens:", ethers.formatUnits(remaining, 2));

// Check total sold
const totalSold = await presaleContract.totalSoldTokens();
console.log("Total sold:", ethers.formatUnits(totalSold, 2));
```

---

## 🔐 Step 7: Security Checklist

### 7.1 Contract Security

- ✅ **Reentrancy Protection**: Implemented
- ✅ **Access Control**: Only owner can manage
- ✅ **Input Validation**: All inputs validated
- ✅ **Emergency Functions**: Withdrawal capabilities
- ✅ **Price Validation**: Prevents zero prices

### 7.2 Operational Security

- ✅ **Private Key Management**: Use hardware wallet for mainnet
- ✅ **Multi-sig Wallet**: Consider for owner functions
- ✅ **Contract Verification**: Verify on block explorer
- ✅ **Testing**: Thoroughly test on testnet first

---

## 📈 Step 8: ICO Management

### 8.1 Monitor ICO Progress

```javascript
// Get comprehensive ICO info
const info = await presaleContract.getTokenInfo();
console.log({
    name: info[0],
    symbol: info[1], 
    available: ethers.formatUnits(info[2], 2),
    totalSupply: ethers.formatUnits(info[3], 2),
    ethPrice: ethers.formatEther(info[4]),
    usdtPrice: info[5] / 1e6,
    presaleActive: info[8],
    usdtEnabled: info[9]
});
```

### 8.2 Emergency Functions (Owner Only)

```javascript
// Pause presale
await presaleContract.togglePresale();

// Withdraw unsold tokens
await presaleContract.withdrawAllTokens();

// Withdraw stuck ETH
await presaleContract.withdrawETH();

// Withdraw stuck USDT  
await presaleContract.withdrawUSDT();
```

---

## 🎉 Step 9: Go Live Checklist

### 9.1 Pre-Launch

- [ ] Contracts deployed and verified
- [ ] USDT address set and enabled
- [ ] Prices configured correctly
- [ ] Frontend updated with contract addresses
- [ ] Thorough testing completed
- [ ] Security audit (recommended for large ICOs)

### 9.2 Launch

- [ ] Announce ICO launch
- [ ] Monitor transactions
- [ ] Provide user support
- [ ] Track metrics and analytics

### 9.3 Post-Launch

- [ ] Regular monitoring
- [ ] Handle user inquiries
- [ ] Prepare for ICO conclusion
- [ ] Plan token distribution

---

## 🚨 Troubleshooting

### Common Issues:

**Issue**: "Transaction reverted"
- **Solution**: Check presale is active and user has sufficient funds

**Issue**: "USDT approval failed"
- **Solution**: Ensure user has USDT balance and gas for approval

**Issue**: "Price calculation wrong"
- **Solution**: Verify decimal handling (2 for MOTRA, 18 for ETH, 6 for USDT)

**Issue**: "Frontend not connecting"
- **Solution**: Check contract address and chain ID in .env

---

## 📞 Support

### Network Information:
- **Base Mainnet**: Chain ID 8453
- **Base Sepolia**: Chain ID 84532
- **USDT Base**: 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb

### Key Contract Functions:
- `buyTokenWithETH()`: Purchase with ETH
- `buyTokenWithUSDT()`: Purchase with USDT  
- `getTokenInfo()`: Get ICO status
- `togglePresale()`: Start/stop ICO
- `updateTokenPrices()`: Update prices

---

## 🎯 Success Metrics

Track these KPIs:
- Total tokens sold
- ETH vs USDT payment ratio
- Number of unique buyers
- Average purchase size
- Transaction success rate

---

**🎉 Congratulations! Your MOTRA ICO is now ready to launch! 🚀**

Remember to:
- Test thoroughly on testnet first
- Keep private keys secure
- Monitor the ICO closely
- Provide excellent user support

Good luck with your ICO! 💪
