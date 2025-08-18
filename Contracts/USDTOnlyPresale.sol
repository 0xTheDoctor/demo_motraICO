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
 * @title USDT-Only Presale Contract
 * @dev A presale contract for selling ERC20 tokens with USDT payments only
 * Supports USDT payments + Thirdweb Buy Crypto for card payments
 */
contract USDTOnlyPresale {
    address public owner;
    address public tokenAddress;
    address public usdtAddress;
    uint256 public usdtPrice; // Price per token in USDT (with 6 decimals)
    uint256 public totalSoldTokens;
    uint8 public tokenDecimals;
    bool public presaleActive;
    
    // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, string paymentMethod);
    event TokenUpdated(address indexed token);
    event USDTAddressUpdated(address indexed usdt);
    event USDTPriceUpdated(uint256 newUsdtPrice);
    event TokensWithdrawn(uint256 amount);
    event USDTReceived(address indexed sender, uint256 amount);
    event PresaleStatusChanged(bool active);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Custom errors (gas efficient)
    error OnlyOwner();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientUSDT();
    error TokenSoldOut();
    error TransferFailed();
    error PresaleInactive();
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

    constructor() {
        owner = msg.sender;
        _status = _NOT_ENTERED;
        presaleActive = false;
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
     * @dev Update the USDT price per token
     * @param _usdtPrice New price per token in USDT (with 6 decimals)
     */
    function updateUSDTPrice(uint256 _usdtPrice) external onlyOwner {
        if (_usdtPrice == 0) revert ZeroAmount();
        usdtPrice = _usdtPrice;
        emit USDTPriceUpdated(usdtPrice);
    }

    /**
     * @dev Toggle presale status
     */
    function togglePresale() external onlyOwner {
        presaleActive = !presaleActive;
        emit PresaleStatusChanged(presaleActive);
    }

    /**
     * @dev Buy tokens with USDT during presale
     * @param _buyAmount Number of tokens to buy (without decimals)
     */
    function buyTokenWithUSDT(uint256 _buyAmount) external nonReentrant presaleIsActive {
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
     * @dev Buy tokens with USDT - Alternative function name for compatibility
     * @param _buyAmount Number of tokens to buy (without decimals)
     */
    function buyToken(uint256 _buyAmount) external nonReentrant presaleIsActive {
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
        uint256 usdtPriceValue,
        address tokenAdd,
        address usdtAdd,
        bool active
    ) {
        if (tokenAddress == address(0)) {
            return ("", "", 0, 0, usdtPrice, address(0), usdtAddress, presaleActive);
        }
        
        IERC20 token = IERC20(tokenAddress);
        return (
            token.name(),
            token.symbol(),
            token.balanceOf(address(this)),
            token.totalSupply(),
            usdtPrice,
            tokenAddress,
            usdtAddress,
            presaleActive
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
     * @dev Get contract balance in USDT
     */
    function getContractUSDTBalance() external view returns (uint256) {
        if (usdtAddress == address(0)) return 0;
        return IERC20(usdtAddress).balanceOf(address(this));
    }

    /**
     * @dev Get remaining tokens available for sale
     */
    function getRemainingTokens() external view returns (uint256) {
        if (tokenAddress == address(0)) return 0;
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    /**
     * @dev Calculate cost in USDT for given token amount
     */
    function calculateUsdtCost(uint256 _tokenAmount) external view returns (uint256) {
        return _tokenAmount * usdtPrice;
    }
}
