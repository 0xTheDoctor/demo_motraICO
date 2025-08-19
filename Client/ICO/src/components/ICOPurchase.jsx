import { useState } from "react";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { BuyWidget } from "thirdweb/react";
import { client, chain, contractAddress, contractABI } from "../config/thirdweb";
import { fromWei } from "../utils/web3";
import "./ICOPurchase.css";

const contract = getContract({
  client,
  chain,
  address: contractAddress,
  abi: contractABI,
});

// USDC contract address on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// USDC ABI for balance and allowance checks
const USDC_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const usdcContract = getContract({
  client,
  chain,
  address: USDC_ADDRESS,
  abi: USDC_ABI,
});

export default function ICOPurchase() {
  const account = useActiveAccount();
  const [tokenAmount, setTokenAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("usdt");
  const [error, setError] = useState(null);
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: tokenInfo } = useReadContract({
    contract,
    method: "getTokenInfo",
    params: [],
  });

  const { data: totalSold } = useReadContract({
    contract,
    method: "totalSoldTokens",
    params: [],
  });

  // Get USDC balance and allowance
  const { data: usdcBalance } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: account ? [account.address] : [""],
  });

  const { data: usdcAllowance } = useReadContract({
    contract: usdcContract,
    method: "allowance",
    params: account ? [account.address, contractAddress] : ["", ""],
  });

  // Calculate required USDC amount
  const requiredUsdcAmount = () => {
    if (!tokenAmount || !tokenInfo || parseFloat(tokenAmount) <= 0) return "0";
    try {
      const readablePrice = parseFloat(fromWei(tokenInfo[5], 6));
      const totalCost = parseFloat(tokenAmount) * readablePrice;
      return totalCost.toFixed(6);
    } catch {
      return "0";
    }
  };

  // Check if approval is needed
  const needsApproval = () => {
    if (!usdcAllowance || !tokenAmount || !tokenInfo) return true;
    const required = parseFloat(requiredUsdcAmount());
    const allowance = parseFloat(fromWei(usdcAllowance, 6));
    return allowance < required;
  };

  // Check if user has sufficient USDC balance
  const hasSufficientBalance = () => {
    if (!usdcBalance || !tokenAmount || !tokenInfo) return false;
    const required = parseFloat(requiredUsdcAmount());
    const balance = parseFloat(fromWei(usdcBalance, 6));
    return balance >= required;
  };

  // Smart purchase function that handles both approval and purchase
  const handleSmartPurchase = async () => {
    if (!account || !tokenAmount || !tokenInfo) return;
    
    setLoading(true);
    try {
      if (needsApproval()) {
        // First, approve USDC spending
        const approveAmount = BigInt("1000000000000"); // 1 million USDC (with 6 decimals)
        
        const approveTransaction = prepareContractCall({
          contract: usdcContract,
          method: "approve",
          params: [contractAddress, approveAmount],
        });

        sendTransaction(approveTransaction, {
          onSuccess: () => {
            // After approval, automatically proceed with purchase
            setTimeout(() => {
              handlePurchase();
            }, 2000); // Wait 2 seconds for approval to be processed
          },
          onError: (error) => {
            console.error("USDC approval failed:", error);
            setError("USDC approval failed. Please try again.");
            setLoading(false);
          },
        });
      } else {
        // Direct purchase if already approved
        handlePurchase();
      }
    } catch (error) {
      console.error("Error preparing transaction:", error);
      setError("Error preparing transaction. Please try again.");
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!account || !tokenAmount || !tokenInfo) return;
    
    try {
      const transaction = prepareContractCall({
        contract,
        method: "buyTokenWithUSDT",
        params: [BigInt(tokenAmount)],
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          setTokenAmount("");
          setError(null);
          alert("Purchase successful!");
          setLoading(false);
        },
        onError: (error) => {
          console.error("Purchase failed:", error);
          
          let errorMessage = "Purchase failed. Please try again.";
          
          if (error.message?.includes("InsufficientUSDT")) {
            errorMessage = "Insufficient USDC balance. Please make sure you have enough USDC in your wallet.";
          } else if (error.message?.includes("InsufficientETH")) {
            errorMessage = "Insufficient ETH balance. Please make sure you have enough ETH for gas fees.";
          } else if (error.message?.includes("TokenSoldOut")) {
            errorMessage = "Sorry, the presale has sold out!";
          } else if (error.message?.includes("PresaleNotActive")) {
            errorMessage = "The presale is currently not active. Please try again later.";
          } else if (error.message?.includes("ZeroAmount")) {
            errorMessage = "Please enter a valid token amount.";
          } else if (error.message?.includes("TransferFailed")) {
            errorMessage = "Transaction failed. Please check your USDC approval and try again.";
          }
          
          setError(errorMessage);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error preparing purchase transaction:", error);
      setError("Error preparing purchase transaction. Please try again.");
      setLoading(false);
    }
  };

  // ✅ Single function to compute readable cost in USDC (string form)
  const displayUsdcCost = () => {
    if (!tokenAmount || !tokenInfo || parseFloat(tokenAmount) <= 0) return "0";
    try {
      const readablePrice = parseFloat(fromWei(tokenInfo[5], 6)); // e.g. 0.01
      const totalCost = parseFloat(tokenAmount) * readablePrice;  // e.g. 150 * 0.01 = 1.5
      return totalCost.toFixed(2); // string "1.50"
    } catch {
      return "0";
    }
  };

  if (!account) {
    return (
      <div className="card">
        <h3>Purchase MOTRA Tokens</h3>
        <p style={{ textAlign: "center", margin: "20px 0", color: "var(--gray-500)" }}>
          Please connect your wallet to purchase tokens
        </p>
      </div>
    );
  }

  return (
    <div className="card ico-purchase">
      <h3 className="ico-purchase__title">Purchase MOTRA Tokens</h3>
      
      {tokenInfo && (
        <div className="ico-purchase__token-info">
          <div className="ico-purchase__token-grid">
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">Token Name</p>
              <p className="ico-purchase__token-value">{tokenInfo[0]}</p>
            </div>
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">Symbol</p>
              <p className="ico-purchase__token-value">{tokenInfo[1]}</p>
            </div>
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">Price per Token</p>
              <p className="ico-purchase__token-value">{fromWei(tokenInfo[5], 6)} USDC</p>
            </div>
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">Available</p>
              <p className="ico-purchase__token-value">{fromWei(tokenInfo[2], 2)} tokens</p>
            </div>
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">Presale Status</p>
              <p className="ico-purchase__token-value" style={{ color: tokenInfo[8] ? "green" : "red" }}>
                {tokenInfo[8] ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="ico-purchase__token-field">
              <p className="ico-purchase__token-label">USDC Payment</p>
              <p className="ico-purchase__token-value" style={{ color: tokenInfo[9] ? "green" : "red" }}>
                {tokenInfo[9] ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="ico-purchase__payment-section">
        <label className="ico-purchase__payment-label">
          Payment Method
        </label>
        <div className="ico-purchase__payment-buttons">
          <button
            className={`ico-purchase__payment-button ${paymentMethod === "usdt" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setPaymentMethod("usdt")}
            disabled={!tokenInfo || !tokenInfo[9]}
          >
            💵 USDC Payment
          </button>
          <button
            className={`ico-purchase__payment-button ${paymentMethod === "fiat" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setPaymentMethod("fiat")}
          >
            💳 Card & Stablecoin
          </button>
        </div>
      </div>

      <div className="ico-purchase__amount-section">
        <label className="ico-purchase__amount-label">
          Token Amount
        </label>
        <input
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          placeholder="Enter amount of tokens to buy"
          min="1"
        />
      </div>

      {paymentMethod === "usdt" && tokenAmount && parseFloat(tokenAmount) > 0 && (
        <div className="ico-purchase__cost-display">
          <p className="ico-purchase__cost-text">
            Cost: <strong>{displayUsdcCost()} USDC</strong>
          </p>
          <p className="ico-purchase__cost-text">
            Your Balance: <strong style={{ color: hasSufficientBalance() ? '#059669' : '#dc2626' }}>
              {usdcBalance ? fromWei(usdcBalance, 6) : "Loading..."} USDC
            </strong>
            {hasSufficientBalance() ? " ✅" : " ❌"}
          </p>
          <p className={`ico-purchase__cost-note ${!hasSufficientBalance() ? 'insufficient' : ''}`}>
            {!hasSufficientBalance() ? "Insufficient USDC balance" : 
             needsApproval() ? "First time purchase requires USDC approval" : "Ready to purchase"}
          </p>
        </div>
      )}

      {paymentMethod === "usdt" && (
        <button
          className="btn-primary ico-purchase__purchase-button"
          onClick={handleSmartPurchase}
          disabled={!tokenAmount || loading || !tokenInfo || !tokenInfo[8] || !tokenInfo[9] || !hasSufficientBalance()}
        >
          {loading ? (needsApproval() ? "Approving..." : "Processing...") : 
           !hasSufficientBalance() ? "Insufficient USDC" :
           needsApproval() ? "Approve & Purchase with USDC" : "Purchase with USDC"}
        </button>
      )}

      {paymentMethod === "fiat" && tokenAmount && parseFloat(tokenAmount) > 0 && (
        <div className="ico-purchase__fiat-section">
          <div className="ico-purchase__fiat-container">
            <h4 className="ico-purchase__fiat-title">
              Buy {tokenAmount} MOTRA Tokens with Fiat
            </h4>
            <p className="ico-purchase__fiat-description">
              Pay with credit cards, bank transfers, or stablecoins
            </p>
            
            <div className="ico-purchase__usdc-calculator">
              <p className="ico-purchase__calculator-title">
                💡 How much USDC do you need?
              </p>
              <p className="ico-purchase__calculator-text">
                For {tokenAmount} MOTRA tokens, you need approximately <strong>{displayUsdcCost()} USDC</strong>
              </p>
            </div>

            <div className="ico-purchase__fiat-options">
              <div className="ico-purchase__fiat-option">
                <h5>Option 1: Buy USDC First</h5>
                <p>Purchase USDC with fiat, then switch to "USDC Payment" to buy tokens</p>
                <BuyWidget
                  client={client}
                  title="Buy USDC to Purchase MOTRA"
                  tokenAddress="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                  chain={chain}
                  amount={displayUsdcCost()}
                  className="ico-purchase__buy-widget"
                  theme="light"
                />
              </div>

              <div className="ico-purchase__fiat-option">
                <h5>Option 2: Direct Purchase (Recommended)</h5>
                <p>Buy tokens directly with fiat - no USDC approval needed!</p>
                <button
                  className="btn-primary ico-purchase__direct-purchase-button"
                  onClick={() => setPaymentMethod("usdt")}
                  style={{ marginTop: "10px" }}
                >
                  Switch to Direct Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(totalSold !== undefined && totalSold !== null && (() => { try { return BigInt(totalSold) > 0n; } catch { return false; } })()) ? (
        <div className="ico-purchase__total-sold">
          <p className="ico-purchase__total-sold-text">
            Total Sold: {fromWei(totalSold, 2)} tokens
          </p>
        </div>
      ) : null}

      {error && (
        <div className="ico-purchase__error-overlay">
          <div className="ico-purchase__error-modal">
            <div className="ico-purchase__error-icon">
              <span className="ico-purchase__error-icon-text">⚠️</span>
            </div>
            
            <h3 className="ico-purchase__error-title">
              Purchase Failed
            </h3>
            
            <p className="ico-purchase__error-message">
              {error}
            </p>
            
            <button
              onClick={() => setError(null)}
              className="ico-purchase__error-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
