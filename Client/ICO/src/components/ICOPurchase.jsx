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

  const handlePurchase = async () => {
    if (!account || !tokenAmount || !tokenInfo) return;
    
    setLoading(true);
    try {
      if (paymentMethod === "usdt") {
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
          },
        });
      }
    } catch {
      console.error("Error preparing transaction");
      setError("Error preparing transaction. Please try again.");
    } finally {
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
            <p className="ico-purchase__cost-note">
              Make sure you have approved USDC spending for this contract
            </p>
          </div>
        )}

      {paymentMethod === "usdt" && (
        <button
          className="btn-primary ico-purchase__purchase-button"
          onClick={handlePurchase}
          disabled={!tokenAmount || loading || !tokenInfo || !tokenInfo[8] || !tokenInfo[9]}
        >
          {loading ? "Processing..." : "Purchase with USDC"}
        </button>
      )}

              {paymentMethod === "fiat" && tokenAmount && parseFloat(tokenAmount) > 0 && (
          <div className="ico-purchase__fiat-section">
            <div className="ico-purchase__fiat-container">
              <h4 className="ico-purchase__fiat-title">
                Buy {tokenAmount} MOTRA Tokens
              </h4>
              <p className="ico-purchase__fiat-description">
                Pay with credit cards, bank transfers, or stablecoins
              </p>
              <p className="ico-purchase__fiat-instructions">
                Step 1: Buy USDC with fiat → Step 2: Use "USDC Payment" to buy MOTRA tokens
              </p>
            
                          <div className="ico-purchase__usdc-calculator">
                <p className="ico-purchase__calculator-title">
                  💡 How much USDC do you need?
                </p>
                <p className="ico-purchase__calculator-text">
                  For {tokenAmount} MOTRA tokens, you need approximately <strong>{displayUsdcCost()} USDC</strong>
                </p>
              </div>
             
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
