import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTokenData } from "@/hooks/useTokenData";
import { TokenInfo } from "@/components/TokenInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SERVICE_WALLET = "wV8V9KDxtqTrumjX9AEPmvYb1vtSMXDMBUq5fouH1Hj";

const VOLUME_PACKAGES = [
  { sol: 1, volume: 10000 },
  { sol: 2, volume: 25000 },
  { sol: 3, volume: 40000 },
  { sol: 5, volume: 65000 },
  { sol: 5.8, volume: 80000 },
  { sol: 7, volume: 110000 },
  { sol: 8, volume: 120000 },
  { sol: 10, volume: 230000 },
  { sol: 15, volume: 300000 },
  { sol: 17, volume: 150000 },
  { sol: 20, volume: 200000 },
  { sol: 35, volume: 300000 },
  { sol: 40, volume: 350000 },
  { sol: 45, volume: 400000 },
  { sol: 50, volume: 450000 },
  { sol: 55, volume: 500000 },
  { sol: 60, volume: 550000 },
  { sol: 85, volume: 500000 },
  { sol: 90, volume: 650000 },
  { sol: 95, volume: 700000 },
  { sol: 100, volume: 750000 },
  { sol: 150, volume: 800000 },
  { sol: 200, volume: 850000 },
  { sol: 200, volume: 900000 },
  { sol: 300, volume: 1000000 },
];

export default function VolumeBoost() {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();
  const { data, isLoading, error } = useTokenData(contractAddress || null);
  const [selectedPackage, setSelectedPackage] = useState<{ sol: number; volume: number } | null>(null);

  const handlePackageSelect = (sol: number, volume: number) => {
    setSelectedPackage({ sol, volume });
    toast({
      title: "Package Selected",
      description: `${sol} SOL - $${volume.toLocaleString()} Vol package selected.`,
    });
  };

  const handleInitializeBoost = async () => {
    if (!publicKey || !selectedPackage) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      const connection = new Connection("https://few-greatest-card.solana-mainnet.quiknode.pro/96ca284c1240d7f288df66b70e01f8367ba78b2b", "confirmed");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(SERVICE_WALLET),
          lamports: selectedPackage.sol * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });
      
      toast({
        title: "Boost Initialized",
        description: `Payment sent! Transaction: ${signature.slice(0, 8)}...`,
      });
      
      setSelectedPackage(null);
    } catch (error) {
      console.error("Transaction failed:", error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background bg-trading-animation">
      <div className="container mx-auto py-8 space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-4 bg-white text-black hover:bg-white/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Select Volume Boost Package</h1>
          <p className="text-muted-foreground">
            Choose a package to boost your token's trading volume
          </p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load token data"}
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="space-y-6">
            <TokenInfo tokenInfo={data.tokenInfo} />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Available Packages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {VOLUME_PACKAGES.map((pkg, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePackageSelect(pkg.sol, pkg.volume)}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-lg font-bold">{pkg.sol} SOL</span>
                    <span className="text-sm text-muted-foreground">
                      ${pkg.volume.toLocaleString()} Vol
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center gap-4 py-4">
              {data?.tokenInfo.logo && (
                <img
                  src={data.tokenInfo.logo}
                  alt={data.tokenInfo.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              {data?.tokenInfo.name && (
                <h3 className="text-xl font-bold">{data.tokenInfo.name}</h3>
              )}
              <Button
                onClick={handleInitializeBoost}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                INITIALIZE BOOST
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
