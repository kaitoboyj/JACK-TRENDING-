import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressInputProps {
  onSubmit: (address: string) => void;
}

const POPULAR_TOKENS = [
  { symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

export function AddressInput({ onSubmit }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const validateSolanaAddress = (addr: string): boolean => {
    // Basic Solana address validation: base58 string, 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(addr.trim());
  };

  const handleSubmit = () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      toast({
        title: "Error",
        description: "Please enter a Solana contract address",
        variant: "destructive",
      });
      return;
    }

    if (!validateSolanaAddress(trimmedAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Solana contract address",
        variant: "destructive",
      });
      return;
    }

    setHasSearched(true);
    onSubmit(trimmedAddress);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Solana Contract Address (e.g., So111111...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1"
        />
        <Button onClick={handleSubmit} size="lg">
          <Search className="w-4 h-4 mr-2" />
          {hasSearched ? "Search" : "Boost"}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Quick load:</span>
        {POPULAR_TOKENS.map((token) => (
          <Button
            key={token.address}
            variant="outline"
            size="sm"
            onClick={() => {
              setAddress(token.address);
              setHasSearched(true);
              onSubmit(token.address);
            }}
          >
            {token.symbol}
          </Button>
        ))}
      </div>
    </div>
  );
}
