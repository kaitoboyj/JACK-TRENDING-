import { useState } from "react";
import { AddressInput } from "@/components/AddressInput";
import { TokenInfo } from "@/components/TokenInfo";
import { DexScreenerEmbed } from "@/components/charts/DexScreenerEmbed";
import { DexScreenerAPIChart } from "@/components/charts/DexScreenerAPIChart";
import { UnmigratedTokenMessage } from "@/components/UnmigratedTokenMessage";
import { useTokenData } from "@/hooks/useTokenData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function ChartViewer() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const { data, isLoading, error } = useTokenData(contractAddress);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Solana Token Chart Viewer</h1>
          <p className="text-muted-foreground">
            Enter a Solana contract address to view live trading charts
          </p>
        </div>

        <AddressInput onSubmit={setContractAddress} />

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[500px] w-full" />
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

            {data.isMigrated ? (
              <>
                <Tabs defaultValue="iframe" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="iframe">DexScreener Embed</TabsTrigger>
                    <TabsTrigger value="api">DexScreener API Chart</TabsTrigger>
                  </TabsList>
                  <TabsContent value="iframe" className="mt-6">
                    <DexScreenerEmbed contractAddress={data.pair.baseToken.address} />
                  </TabsContent>
                  <TabsContent value="api" className="mt-6">
                    <DexScreenerAPIChart pair={data.pair} />
                  </TabsContent>
                </Tabs>

                <Button 
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                  onClick={() => toast({
                    title: "Boost Volume",
                    description: "Volume boost feature coming soon!",
                  })}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Boost Volume
                </Button>
              </>
            ) : (
              <UnmigratedTokenMessage />
            )}
          </div>
        )}

        {!contractAddress && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Enter a Solana contract address above to get started
          </div>
        )}
      </div>
    </div>
  );
}
