# 🚀 MOTRA ICO - Complete Step-by-Step Deployment Guide

## 📋 Project Overview

**MOTRA ICO Specifications:**
- **Token Name**: MOTRA Token
- **Symbol**: MOTRA  
- **Total Supply**: 1,000,000,000 MOTRA
- **Decimals**: 2 (displays as 10,000,000,000.00)
- **Presale Amount**: 100,000,000 MOTRA (10% of supply)
- **Price**: $0.01 USD per token
- **Payment Methods**: ETH, USDT, Fiat (via Thirdweb)
- **Network**: Base Mainnet (recommended)

---

## 🛠️ STEP 1: Environment Setup

### 1.1 Install Node.js
```bash
# Download and install Node.js v16 or higher from:
# https://nodejs.org/
```

### 1.2 Verify Installation
```bash
node --version
npm --version
```

### 1.3 Install MetaMask
1. Go to: https://metamask.io/
2. Install browser extension
3. Create new wallet or import existing
4. **IMPORTANT**: Save your seed phrase securely!

### 1.4 Add Base Network to MetaMask
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Add manually:
   - **Network Name**: Base
   - **RPC URL**: https://mainnet.base.org
   - **Chain ID**: 8453
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://basescan.org

### 1.5 Get Base ETH
1. Bridge ETH from Ethereum to Base using:
   - https://bridge.base.org/
   - Or buy directly on Coinbase
2. You'll need ~0.01-0.05 ETH for deployment

---

## 📝 STEP 2: Prepare Contract Files

### 2.1 Open Remix IDE
1. Go to: https://remix.ethereum.org
2. Click "Create New Workspace"
3. Choose "Blank" template
4. Name it "MOTRA-ICO"

### 2.2 Create MotraToken.sol
1. Right-click "contracts" folder
2. Select "New File"
3. Name it: `MotraToken.sol`
4. Copy the code from: `Contracts/MotraToken.sol` in your project

### 2.3 Create MotraPresale.sol (USDT-Only)
1. Right-click "contracts" folder
2. Select "New File"
3. Name it: `MotraPresale.sol`
4. Copy the code from: `Contracts/USDTOnlyPresale.sol` in your project

**✅ USDT-Only Contract Benefits:**
- **No ETH complexity** - Only USDT payments
- **Cleaner code** - Removed all ETH-related functions
- **Simpler pricing** - Only one price to manage (USDT)
- **Perfect for your needs** - USDT + Thirdweb Buy Crypto
- **Gas efficient** - Smaller contract size
- **No ETH price updates needed** - Set once and forget



---

## 🔧 STEP 3: Compile Contracts

### 3.1 Set Compiler Settings
1. Go to "Solidity Compiler" tab
2. Set compiler version to **0.8.19**
3. Enable optimization: **200 runs**
4. Set EVM version to **paris**

### 3.2 Compile MotraToken
1. Select `MotraToken.sol` file
2. Click "Compile MotraToken.sol"
3. ✅ Should show green checkmark

### 3.3 Compile MotraPresale (NewContract)
1. Select `MotraPresale.sol` file (with NewContract.sol code)
2. Click "Compile MotraPresale.sol"
3. ✅ Should show green checkmark with no warnings

---

## 🚀 STEP 4: Deploy Contracts

### 4.1 Connect MetaMask
1. Go to "Deploy & Run Transactions" tab
2. Set Environment to "Injected Provider - MetaMask"
3. Click "Connect" if MetaMask isn't connected
4. **IMPORTANT**: Make sure you're on Base Mainnet (Chain ID: 8453)

### 4.2 Deploy MOTRA Token
1. **Select Contract**: Choose "MotraToken"
2. **Constructor Parameter**: Enter your wallet address
   ```
   0xYourWalletAddressHere
   ```
3. **Click "Deploy"**
4. **Confirm in MetaMask**
5. **Wait for confirmation**
6. **Copy the deployed address** - save it!

### 4.3 Deploy ICO Contract
1. **Select Contract**: Choose "MotraPresale"
2. **No constructor parameters needed**
3. **Click "Deploy"**
4. **Confirm in MetaMask**
5. **Wait for confirmation**
6. **Copy the deployed address** - save it!

---

## ⚙️ STEP 5: Configure ICO Contract

### 5.1 Set Token Address
1. Expand your deployed MotraPresale contract
2. Find `updateToken` function
3. Enter your MOTRA token address (from step 4.2)
4. Click "transact"
5. Confirm in MetaMask

### 5.2 Set USDT Price
1. Find `updateUSDTPrice` function
2. Enter parameter:
   - `_usdtPrice`: `10000` (0.01 USDT with 6 decimals)
3. Click "transact"
4. Confirm in MetaMask

**That's it!** No ETH price needed! ✅

### 5.3 Transfer Presale Tokens
1. Go back to your **MotraToken** contract
2. Find `transfer` function
3. Enter parameters:
   - `recipient`: Your ICO contract address (from step 4.3)
   - `amount`: `10000000000` (100M tokens with 2 decimals)
4. Click "transact"
5. Confirm in MetaMask

### 5.4 Activate Presale
1. Back to **MotraPresale** contract
2. Find `togglePresale` function
3. Click "transact"
4. Confirm in MetaMask

---

## 🎯 STEP 6: Enable USDC Payments

### 6.1 Set USDC Address
1. Find `updateUSDTAddress` function (it handles USDC too)
2. Enter: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
3. Click "transact"
4. Confirm in MetaMask

### 6.2 Enable USDC Payments
1. Find `toggleUSDT` function (it toggles USDC payments)
2. Click "transact"
3. Confirm in MetaMask

**✅ Your contract now accepts USDC payments!**

---

## ✅ STEP 7: Verify Deployment

### 7.1 Check Token Info
1. Find `getTokenInfo` function
2. Click "call"
3. Verify the output:
   - Name: "MOTRA Token"
   - Symbol: "MOTRA"
   - Balance: 100000000 (presale amount)
   - Active: true

### 7.2 Test USDC Price Calculation
1. Find `calculateUsdtCost` function
2. Enter `1000` (for 1000 tokens)
3. Click "call"
4. Note the USDC cost for testing (should be 10 USDC for 1000 tokens)

---

## 📱 STEP 8: Setup Frontend

### 8.1 Install Dependencies
```bash
cd Client/ICO
npm install
```

### 8.2 Create Environment File
1. Create `.env` file in `Client/ICO/` folder
2. Add your configuration:

```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
VITE_CONTRACT_ADDRESS=YOUR_ICO_CONTRACT_ADDRESS_FROM_STEP_4_3
VITE_CHAIN_ID=8453
```

### 8.3 Get Thirdweb Client ID
1. Go to: https://thirdweb.com/dashboard
2. Create new project or use existing
3. Copy your Client ID
4. Update `VITE_THIRDWEB_CLIENT_ID` in `.env`

### 8.4 Start Frontend
```bash
npm run dev
```

### 8.5 Test Frontend
1. Open browser to the local URL (usually http://localhost:5173)
2. Connect MetaMask
3. Switch to Base network
4. Test the interface

---

## 🧪 STEP 9: Test Your ICO

### 9.1 Test ETH Purchase
1. Connect wallet to frontend
2. Select "ETH Payment"
3. Enter token amount (e.g., 1000)
4. Click "Purchase with ETH"
5. Confirm transaction in MetaMask
6. Verify tokens received

### 9.2 Test USDT Purchase (If Enabled)
1. Ensure you have USDT in your wallet
2. Select "USDT Payment"
3. Approve USDT spending if needed
4. Enter token amount
5. Click "Purchase with USDT"
6. Confirm transaction
7. Verify tokens received

### 9.3 Test Fiat Payment
1. Select "Card & Stablecoin"
2. Enter token amount
3. Use Thirdweb Buy Widget
4. Complete payment process

---

## 📊 STEP 10: Monitor ICO

### 10.1 Check ICO Status
Use `getTokenInfo()` function to monitor:
- Available tokens
- Total sold
- Presale status
- USDT status

### 10.2 Track Transactions
- Monitor BaseScan for transactions
- Check your wallet for incoming payments
- Track token sales

### 10.3 Emergency Functions
If needed, use these owner functions:
- `togglePresale()` - Pause/resume ICO
- `withdrawAllTokens()` - Withdraw unsold tokens
- `withdrawETH()` - Withdraw collected ETH
- `withdrawUSDT()` - Withdraw collected USDT

---

## 🎉 STEP 11: Go Live!

### 11.1 Pre-Launch Checklist
- [ ] Contracts deployed and working
- [ ] Frontend connected and tested
- [ ] USDT payments enabled (if desired)
- [ ] Test purchases successful
- [ ] Emergency functions tested

### 11.2 Launch
- [ ] Announce ICO launch
- [ ] Share frontend URL
- [ ] Monitor transactions
- [ ] Provide user support

### 11.3 Post-Launch
- [ ] Regular monitoring
- [ ] Handle user inquiries
- [ ] Track metrics
- [ ] Plan ICO conclusion

---

## 📋 Important Addresses & Values

### Network Information
- **Base Mainnet**: Chain ID 8453
- **Base RPC**: https://mainnet.base.org
- **BaseScan**: https://basescan.org

### USDC Addresses
- **Base USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Ethereum USDC**: `0xA0b86a33E6417c32A0E9c2E6c6a5A4b3a8a2E0C2`

### Pricing Values (USDC-Only)
- **USDC Price**: `10000` (0.01 USDC with 6 decimals)
- **Presale Amount**: `10000000000` (100M tokens with 2 decimals)
- **No ETH Price Needed!** ✅

### Contract Functions (USDT-Only)
- `buyTokenWithUSDT()` - Purchase with USDT
- `buyToken()` - Purchase with USDT (alternative name)
- `getTokenInfo()` - Get comprehensive ICO status
- `togglePresale()` - Start/stop ICO
- `updateUSDTPrice()` - Update USDT price
- `updateUSDTAddress()` - Set USDT token address
- `getContractUSDTBalance()` - Check USDT balance
- `getRemainingTokens()` - Check available tokens
- `calculateUsdtCost()` - Calculate USDT cost for tokens
- `withdrawAllTokens()` - Emergency token withdrawal
- `withdrawUSDT()` - Withdraw collected USDT
- `transferOwnership()` - Transfer contract ownership

**✅ Much Simpler!** No ETH-related functions to manage!

---

## 🚨 Troubleshooting

### Common Issues:

**"Transaction reverted"**
- Check presale is active
- Verify user has sufficient funds
- Ensure correct ETH amount sent

**"USDT approval failed"**
- User needs USDT balance
- User needs to approve USDT spending
- Check USDT is enabled

**"Frontend not connecting"**
- Verify contract address in .env
- Check chain ID is 8453
- Ensure MetaMask is connected

**"Price calculation wrong"**
- Verify decimal handling (2 for MOTRA, 18 for ETH, 6 for USDT)
- Check price values are set correctly

---

## 🎯 Success Metrics

Track these KPIs:
- Total tokens sold
- ETH vs USDT payment ratio
- Number of unique buyers
- Average purchase size
- Transaction success rate

---

## 📞 Support Resources

### Documentation
- **Remix IDE**: https://remix.ethereum.org
- **Base Network**: https://base.org
- **Thirdweb**: https://thirdweb.com
- **MetaMask**: https://metamask.io

### Block Explorers
- **BaseScan**: https://basescan.org
- **Etherscan**: https://etherscan.io

---

## 🎉 Congratulations!

**Your MOTRA ICO is now LIVE!** 🚀

You've successfully:
- ✅ Deployed MOTRA Token with 2 decimals
- ✅ Deployed ICO Contract with dual payment support
- ✅ Configured pricing at $0.01 per token
- ✅ Set up 100M token presale
- ✅ Enabled ETH, USDT, and Fiat payments
- ✅ Connected frontend interface
- ✅ Tested all functionality

**Your ICO is ready to accept investors!** 💪

Remember to:
- Monitor transactions closely
- Provide excellent user support
- Keep your private keys secure
- Plan for ICO conclusion

**Good luck with your MOTRA ICO!** 🎯
