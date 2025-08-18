# USDT Payment Implementation Guide for MOTRA ICO

## Overview

This guide explains how to implement USDT payments in your MOTRA ICO platform. The updated contract now supports both ETH and USDT payments, giving users more flexibility in purchasing MOTRA tokens.

## 🚀 Quick Setup

### 1. Deploy the Updated Contract

The `NewContract.sol` has been updated with USDT support. Deploy it to your preferred network (Base mainnet recommended).

### 2. Configure USDT Address

After deployment, set the USDT contract address:

```javascript
// USDT addresses for different networks
const USDT_ADDRESSES = {
  // Base Mainnet
  base: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  
  // Ethereum Mainnet
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  
  // Polygon
  polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  
  // BSC
  bsc: "0x55d398326f99059fF775485246999027B3197955",
  
  // Arbitrum
  arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
};
```

### 3. Set Token Prices

Configure both ETH and USDT prices:

```javascript
// Example: $0.01 per token
const ETH_PRICE = ethers.parseEther("0.00001"); // Adjust based on ETH price
const USDT_PRICE = 10000; // 0.01 USDT = 10000 (6 decimals)

// Set both prices
await contract.updateTokenPrices(ETH_PRICE, USDT_PRICE);
```

### 4. Enable USDT Payments

```javascript
// Enable USDT payments
await contract.toggleUSDT();
```

## 📋 Contract Functions

### New USDT Functions

| Function | Description |
|----------|-------------|
| `buyTokenWithUSDT(uint256 _buyAmount)` | Purchase tokens with USDT |
| `updateUSDTAddress(address _usdtAddress)` | Set USDT contract address |
| `updateUsdtPrice(uint256 _usdtPrice)` | Update USDT price only |
| `updateTokenPrices(uint256 _ethPrice, uint256 _usdtPrice)` | Update both prices |
| `toggleUSDT()` | Enable/disable USDT payments |
| `calculateUsdtCost(uint256 _tokenAmount)` | Calculate USDT cost for tokens |
| `getContractUSDTBalance()` | Get contract's USDT balance |
| `withdrawUSDT()` | Emergency USDT withdrawal |

### Updated Functions

| Function | Changes |
|----------|---------|
| `getTokenInfo()` | Now returns USDT price and status |
| `buyToken()` | Legacy function, still works with ETH |

## 💰 Price Calculation

### For $0.01 per token:

```javascript
// USDT price calculation (USDT has 6 decimals)
const USDT_PRICE = 10000; // 0.01 * 10^6 = 10000

// ETH price calculation (ETH has 18 decimals)
// Assuming ETH = $3000, then 0.01/3000 = 0.00000333 ETH
const ETH_PRICE = ethers.parseEther("0.00000333");
```

## 🔧 Frontend Integration

### 1. Updated ICOPurchase Component

The `ICOPurchase.jsx` component now supports:
- ETH payment option
- USDT payment option  
- Fiat payment via Thirdweb Buy Widget
- Real-time price calculation for both currencies
- USDT approval status checking

### 2. USDT Approval Process

Users need to approve USDT spending before purchasing:

```javascript
// Check USDT allowance
const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
const allowance = await usdtContract.allowance(userAddress, contractAddress);

// If allowance is insufficient, request approval
if (allowance < requiredAmount) {
  const approveTx = await usdtContract.approve(contractAddress, requiredAmount);
  await approveTx.wait();
}
```

## 🎯 User Experience Flow

### ETH Payment Flow:
1. User selects "ETH Payment"
2. Enters token amount
3. Sees ETH cost calculation
4. Clicks "Purchase with ETH"
5. Confirms transaction in wallet

### USDT Payment Flow:
1. User selects "USDT Payment"
2. Enters token amount
3. Sees USDT cost calculation
4. System checks USDT allowance
5. If needed, prompts for USDT approval
6. Clicks "Purchase with USDT"
7. Confirms transaction in wallet

## 🔒 Security Considerations

### 1. USDT Allowance Management
- Always check allowance before purchase
- Consider implementing allowance reset after purchase
- Monitor for potential allowance attacks

### 2. Price Validation
- Validate USDT price on-chain
- Implement price oracle integration for real-time rates
- Consider slippage protection

### 3. Emergency Functions
- `withdrawUSDT()` for stuck USDT
- `withdrawETH()` for stuck ETH
- `withdrawAllTokens()` for stuck tokens

## 📊 Testing Checklist

### Contract Testing:
- [ ] Deploy contract successfully
- [ ] Set USDT address
- [ ] Set token prices
- [ ] Enable USDT payments
- [ ] Test ETH purchase
- [ ] Test USDT purchase
- [ ] Test insufficient USDT balance
- [ ] Test insufficient USDT allowance
- [ ] Test emergency withdrawals

### Frontend Testing:
- [ ] ETH payment flow works
- [ ] USDT payment flow works
- [ ] Price calculations are correct
- [ ] USDT approval process works
- [ ] Error handling for failed transactions
- [ ] Responsive design on mobile

## 🚨 Common Issues & Solutions

### Issue: USDT Approval Fails
**Solution:** Check if user has sufficient USDT balance and gas fees

### Issue: Transaction Reverts
**Solution:** Verify presale is active and USDT payments are enabled

### Issue: Price Mismatch
**Solution:** Ensure USDT price is set with correct decimals (6 decimals)

### Issue: Allowance Issues
**Solution:** Clear existing allowance and set new one

## 📈 Monitoring & Analytics

### Track These Metrics:
- ETH vs USDT payment distribution
- Average transaction size per payment method
- Failed transaction rates
- USDT approval success rates

### Events to Monitor:
- `TokensPurchased` with payment method
- `USDTAddressUpdated`
- `PriceUpdated`
- `USDTStatusChanged`

## 🔄 Migration from ETH-Only

If you're upgrading from the ETH-only contract:

1. **Deploy new contract**
2. **Transfer tokens** to new contract
3. **Set USDT configuration**
4. **Update frontend** to use new contract
5. **Test thoroughly** before going live

## 📞 Support

For technical support or questions about USDT implementation:
- Check contract events for debugging
- Verify USDT contract address is correct
- Ensure proper decimal handling (6 for USDT, 18 for ETH)
- Test on testnet before mainnet deployment

---

**Note:** Always test thoroughly on testnet before deploying to mainnet. USDT payments add complexity to the system, so ensure all edge cases are handled properly.
