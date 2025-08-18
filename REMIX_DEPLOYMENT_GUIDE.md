# 🚀 MOTRA ICO Deployment Guide - Remix IDE

## 📋 Overview

Deploy your MOTRA ICO using **Remix IDE** - no complex setup required! This guide provides exact steps to deploy both contracts and configure your ICO.

### **ICO Specifications:**
- **Token Name**: MOTRA Token  
- **Symbol**: MOTRA
- **Total Supply**: 1,000,000,000 MOTRA
- **Decimals**: 2 (displays as 10,000,000,000.00)
- **Presale Amount**: 100,000,000 MOTRA (10% of supply)
- **Price**: $0.01 USD per token

---

## 🛠️ Step 1: Prepare Contracts for Remix

### 1.1 Open Remix IDE
Go to: **https://remix.ethereum.org**

### 1.2 Create New Workspace
1. Click "Create New Workspace"
2. Choose "Blank" template
3. Name it "MOTRA-ICO"

---

## 📝 Step 2: Add Contract Files

### 2.1 Create MotraToken.sol

Create new file: `contracts/MotraToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import OpenZeppelin contracts (Remix will auto-import)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MOTRA Token
 * @dev Fixed supply ERC20 token with 2 decimals 
 * Total Supply: 1,000,000,000 MOTRA 
 * Decimals: 2
 */
contract MotraToken is ERC20, ERC20Permit {
    
    constructor(address recipient) ERC20("MOTRA Token", "MOTRA") ERC20Permit("MOTRA Token") {
        // Mint 1 billion tokens with 2 decimals = 100,000,000,000 base units
        _mint(recipient, 1000000000 * 10 ** decimals());
    }

    /**
     * @dev Returns 2 decimals for MOTRA token
     * This means 100 base units = 1.00 MOTRA
     */
    function decimals() public pure override returns (uint8) {
        return 2;
    }
}
```

### 2.2 Create MotraPresale.sol

Create new file: `contracts/MotraPresale.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
}

/**
 * @title MotraPresale
 * @dev A presale contract for selling ERC20 tokens with ETH and USDT payment support
 */
contract MotraPresale {
    address public owner;
    address public tokenAddress;
    address public usdtAddress;
    uint256 public tokenPrice; // Price per token in wei (for ETH payments)
    uint256 public usdtPrice; // Price per token in USDT (with 6 decimals)
    uint256 public totalSoldTokens;
    uint8 public tokenDecimals;
    bool public presaleActive;
    bool public usdtEnabled;
    
    // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, string paymentMethod);
    event TokenUpdated(address indexed token);
    event USDTAddressUpdated(address indexed usdt);
    event PriceUpdated(uint256 newEthPrice, uint256 newUsdtPrice);
    event TokensWithdrawn(uint256 amount);
    event EthReceived(address indexed sender, uint256 amount);
    event USDTReceived(address indexed sender, uint256 amount);
    event PresaleStatusChanged(bool active);
    event USDTStatusChanged(bool enabled);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Custom errors (gas efficient)
    error OnlyOwner();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientETH();
    error InsufficientUSDT();
    error TokenSoldOut();
    error TransferFailed();
    error PresaleInactive();
    error USDTNotEnabled();
    error ReentrancyGuard();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuard();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier presaleIsActive() {
        if (!presaleActive) revert PresaleInactive();
        _;
    }

    modifier usdtIsEnabled() {
        if (!usdtEnabled) revert USDTNotEnabled();
        _;
    }

    constructor() {
        owner = msg.sender;
        _status = _NOT_ENTERED;
        presaleActive = false;
        usdtEnabled = false;
    }

    /**
     * @dev Update the token address for the presale
     * @param _tokenAddress The address of the ERC20 token
     */
    function updateToken(address _tokenAddress) external onlyOwner {
        if (_tokenAddress == address(0)) revert ZeroAddress();
        tokenAddress = _tokenAddress;
        tokenDecimals = IERC20(_tokenAddress).decimals();
        emit TokenUpdated(tokenAddress);
    }

    /**
     * @dev Update the USDT address
     * @param _usdtAddress The address of the USDT token
     */
    function updateUSDTAddress(address _usdtAddress) external onlyOwner {
        if (_usdtAddress == address(0)) revert ZeroAddress();
        usdtAddress = _usdtAddress;
        emit USDTAddressUpdated(usdtAddress);
    }

    /**
     * @dev Update the token prices for both ETH and USDT
     * @param _ethPrice New price per token in wei (for ETH payments)
     * @param _usdtPrice New price per token in USDT (with 6 decimals)
     */
    function updateTokenPrices(uint256 _ethPrice, uint256 _usdtPrice) external onlyOwner {
        if (_ethPrice == 0) revert ZeroAmount();
        if (_usdtPrice == 0) revert ZeroAmount();
        
        tokenPrice = _ethPrice;
        usdtPrice = _usdtPrice;
        emit PriceUpdated(tokenPrice, usdtPrice);
    }

    /**
     * @dev Toggle presale status
     */
    function togglePresale() external onlyOwner {
        presaleActive = !presaleActive;
        emit PresaleStatusChanged(presaleActive);
    }

    /**
     * @dev Toggle USDT payment status
     */
    function toggleUSDT() external onlyOwner {
        usdtEnabled = !usdtEnabled;
        emit USDTStatusChanged(usdtEnabled);
    }

    /**
     * @dev Buy tokens with ETH during presale
     * @param _buyAmount Number of tokens to buy (without decimals)
     */
    function buyTokenWithETH(uint256 _buyAmount) external payable nonReentrant presaleIsActive {
        if (_buyAmount == 0) revert ZeroAmount();
        if (tokenAddress == address(0)) revert ZeroAddress();
        
        uint256 totalCost = _buyAmount * tokenPrice;
        if (msg.value != totalCost) revert InsufficientETH();

        IERC20 token = IERC20(tokenAddress);
        uint256 amountWithDecimals = _buyAmount * (10 ** uint256(tokenDecimals));
        
        if (amountWithDecimals > token.balanceOf(address(this))) revert TokenSoldOut();
        
        // Transfer tokens to buyer
        if (!token.transfer(msg.sender, amountWithDecimals)) revert TransferFailed();
        
        // Transfer ETH to owner
        (bool success, ) = payable(owner).call{value: msg.value}("");
        if (!success) revert TransferFailed();
        
        totalSoldTokens += amountWithDecimals;
        emit TokensPurchased(msg.sender, amountWithDecimals, totalCost, "ETH");
    }

    /**
     * @dev Legacy function for backward compatibility (uses ETH)
     * @param _buyAmount Number of tokens to buy (without decimals)
     */
    function buyToken(uint256 _buyAmount) external payable nonReentrant presaleIsActive {
        if (_buyAmount == 0) revert ZeroAmount();
        if (tokenAddress == address(0)) revert ZeroAddress();
        
        uint256 totalCost = _buyAmount * tokenPrice;
        if (msg.value != totalCost) revert InsufficientETH();

        IERC20 token = IERC20(tokenAddress);
        uint256 amountWithDecimals = _buyAmount * (10 ** uint256(tokenDecimals));
        
        if (amountWithDecimals > token.balanceOf(address(this))) revert TokenSoldOut();
        
        // Transfer tokens to buyer
        if (!token.transfer(msg.sender, amountWithDecimals)) revert TransferFailed();
        
        // Transfer ETH to owner
        (bool success, ) = payable(owner).call{value: msg.value}("");
        if (!success) revert TransferFailed();
        
        totalSoldTokens += amountWithDecimals;
        emit TokensPurchased(msg.sender, amountWithDecimals, totalCost, "ETH");
    }

    /**
     * @dev Buy tokens with USDT during presale
     * @param _buyAmount Number of tokens to buy (without decimals)
     */
    function buyTokenWithUSDT(uint256 _buyAmount) external nonReentrant presaleIsActive usdtIsEnabled {
        if (_buyAmount == 0) revert ZeroAmount();
        if (tokenAddress == address(0)) revert ZeroAddress();
        if (usdtAddress == address(0)) revert ZeroAddress();
        
        uint256 totalCost = _buyAmount * usdtPrice;
        
        IERC20 token = IERC20(tokenAddress);
        IERC20 usdt = IERC20(usdtAddress);
        uint256 amountWithDecimals = _buyAmount * (10 ** uint256(tokenDecimals));
        
        if (amountWithDecimals > token.balanceOf(address(this))) revert TokenSoldOut();
        
        // Check USDT allowance and balance
        if (usdt.balanceOf(msg.sender) < totalCost) revert InsufficientUSDT();
        if (usdt.allowance(msg.sender, address(this)) < totalCost) revert InsufficientUSDT();
        
        // Transfer USDT from buyer to owner
        if (!usdt.transferFrom(msg.sender, owner, totalCost)) revert TransferFailed();
        
        // Transfer tokens to buyer
        if (!token.transfer(msg.sender, amountWithDecimals)) revert TransferFailed();
        
        totalSoldTokens += amountWithDecimals;
        emit TokensPurchased(msg.sender, amountWithDecimals, totalCost, "USDT");
    }

    /**
     * @dev Get comprehensive token information
     */
    function getTokenInfo() external view returns (
        string memory name,
        string memory symbol,
        uint256 balance,
        uint256 totalSupply,
        uint256 ethPrice,
        uint256 usdtPrice,
        address tokenAdd,
        address usdtAdd,
        bool active,
        bool usdtActive
    ) {
        if (tokenAddress == address(0)) {
            return ("", "", 0, 0, tokenPrice, usdtPrice, address(0), usdtAddress, presaleActive, usdtEnabled);
        }
        
        IERC20 token = IERC20(tokenAddress);
        return (
            token.name(),
            token.symbol(),
            token.balanceOf(address(this)),
            token.totalSupply(),
            tokenPrice,
            usdtPrice,
            tokenAddress,
            usdtAddress,
            presaleActive,
            usdtEnabled
        );
    }

    /**
     * @dev Emergency function to withdraw all tokens
     */
    function withdrawAllTokens() external onlyOwner nonReentrant {
        if (tokenAddress == address(0)) revert ZeroAddress();
        
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        if (balance == 0) revert ZeroAmount();
        
        if (!token.transfer(owner, balance)) revert TransferFailed();
        emit TokensWithdrawn(balance);
    }

    /**
     * @dev Emergency function to withdraw ETH (if any gets stuck)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroAmount();
        
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Emergency function to withdraw USDT (if any gets stuck)
     */
    function withdrawUSDT() external onlyOwner {
        if (usdtAddress == address(0)) revert ZeroAddress();
        
        IERC20 usdt = IERC20(usdtAddress);
        uint256 balance = usdt.balanceOf(address(this));
        if (balance == 0) revert ZeroAmount();
        
        if (!usdt.transfer(owner, balance)) revert TransferFailed();
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Receive function for handling direct ETH transfers
     */
    receive() external payable {
        (bool success, ) = payable(owner).call{value: msg.value}("");
        if (!success) revert TransferFailed();
        emit EthReceived(msg.sender, msg.value);
    }

    /**
     * @dev Get remaining tokens available for sale
     */
    function getRemainingTokens() external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    /**
     * @dev Calculate cost in ETH for given token amount
     */
    function calculateEthCost(uint256 _tokenAmount) external view returns (uint256) {
        return _tokenAmount * tokenPrice;
    }

    /**
     * @dev Calculate cost in USDT for given token amount
     */
    function calculateUsdtCost(uint256 _tokenAmount) external view returns (uint256) {
        return _tokenAmount * usdtPrice;
    }
}
```

---

## 🔧 Step 3: Compile Contracts

### 3.1 Set Compiler Version
1. Go to "Solidity Compiler" tab
2. Set compiler version to **0.8.19** or higher
3. Enable optimization (200 runs)

### 3.2 Compile
1. Select `MotraToken.sol`
2. Click "Compile MotraToken.sol"
3. Select `MotraPresale.sol`  
4. Click "Compile MotraPresale.sol"

✅ Both contracts should compile without errors

---

## 🚀 Step 4: Deploy Contracts

### 4.1 Connect Wallet
1. Go to "Deploy & Run Transactions" tab
2. Set Environment to "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. Switch to **Base Mainnet** (Chain ID: 8453)

### 4.2 Deploy MOTRA Token First

1. **Select Contract**: Choose "MotraToken"
2. **Constructor Parameter**: Enter your wallet address (token recipient)
   ```
   0xYourWalletAddress
   ```
3. **Click "Deploy"**
4. **Confirm transaction** in MetaMask
5. **Copy the deployed address** - you'll need it!

### 4.3 Deploy ICO Contract

1. **Select Contract**: Choose "MotraPresale"
2. **No constructor parameters needed**
3. **Click "Deploy"**
4. **Confirm transaction** in MetaMask
5. **Copy the deployed address** - this is your ICO contract!

---

## ⚙️ Step 5: Configure ICO Contract

### 5.1 Set Token Address
1. Expand your deployed MotraPresale contract
2. Find `updateToken` function
3. Enter your MOTRA token address
4. Click "transact"

### 5.2 Set Token Prices

For **$0.01 per token**:

1. Find `updateTokenPrices` function
2. Enter parameters:
   - `_ethPrice`: `3333333333333` (for ETH ≈ $3000)
   - `_usdtPrice`: `10000` (0.01 USDT with 6 decimals)
3. Click "transact"

### 5.3 Transfer Presale Tokens

1. Go back to your **MotraToken** contract
2. Find `transfer` function
3. Enter parameters:
   - `recipient`: Your ICO contract address
   - `amount`: `10000000000` (100M tokens with 2 decimals)
4. Click "transact"

### 5.4 Activate Presale

1. Back to **MotraPresale** contract
2. Find `togglePresale` function
3. Click "transact"

---

## 🎯 Step 6: Enable USDT Payments (Optional)

### 6.1 Set USDT Address

For **Base Mainnet**:
1. Find `updateUSDTAddress` function
2. Enter: `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb`
3. Click "transact"

### 6.2 Enable USDT

1. Find `toggleUSDT` function
2. Click "transact"

---

## ✅ Step 7: Verify Deployment

### 7.1 Check Token Info
1. Find `getTokenInfo` function
2. Click "call"
3. Verify:
   - Name: "MOTRA Token"
   - Symbol: "MOTRA"  
   - Balance: 100,000,000 (presale amount)
   - Active: true

### 7.2 Test Purchase (Optional)
1. Find `calculateEthCost` function
2. Enter `1000` (for 1000 tokens)
3. Check the ETH cost
4. Use `buyToken` with the calculated ETH amount

---

## 📱 Step 8: Update Frontend

### 8.1 Update Contract Address
In `Client/ICO/.env`:
```env
VITE_CONTRACT_ADDRESS=YOUR_ICO_CONTRACT_ADDRESS_FROM_REMIX
```

### 8.2 Start Frontend
```bash
cd Client/ICO
npm run dev
```

---

## 📋 Step 9: Contract Addresses Summary

After deployment, you'll have:

```
✅ MOTRA Token Address: 0x...
✅ ICO Contract Address: 0x...
✅ Network: Base Mainnet (8453)
✅ Presale Amount: 100,000,000 MOTRA
✅ Price: $0.01 per token
```

---

## 🎉 Step 10: Go Live!

Your ICO is now **LIVE** and ready! Users can:

- **Buy with ETH**: Direct ETH payments
- **Buy with USDT**: USDT token payments (if enabled)
- **Buy with Fiat**: Credit cards via Thirdweb

---

## 🚨 Important Notes

### Security:
- ✅ **Owner Only**: Only you can manage prices and settings
- ✅ **Emergency Functions**: You can withdraw tokens/ETH if needed
- ✅ **Reentrancy Protection**: Built-in security

### Pricing:
- **ETH Price**: Adjustable based on current ETH value
- **USDT Price**: Fixed at $0.01 (10000 with 6 decimals)
- **2 Decimals**: Tokens display as 1000.00 MOTRA

### Management:
- Use `togglePresale()` to pause/resume
- Use `updateTokenPrices()` to adjust pricing
- Use `withdrawAllTokens()` for emergency withdrawal

---

## 🎯 Success! 

Your **MOTRA ICO is now LIVE** using Remix IDE! 

**No complex setup, no Hardhat, just simple browser-based deployment!** 🚀

Remember to:
- Save your contract addresses
- Test with small amounts first  
- Monitor the ICO progress
- Provide user support

**Congratulations on launching your ICO!** 🎉
