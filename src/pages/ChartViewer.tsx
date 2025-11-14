import { useState } from "react";
import { AddressInput } from "@/components/AddressInput";
import { TokenInfo } from "@/components/TokenInfo";
import { DexScreenerEmbed } from "@/components/charts/DexScreenerEmbed";
import { DexScreenerAPIChart } from "@/components/charts/DexScreenerAPIChart";
import { UnmigratedTokenMessage } from "@/components/UnmigratedTokenMessage";
import { ServiceSelectionModal } from "@/components/ServiceSelectionModal";
import { useTokenData } from "@/hooks/useTokenData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
// Use public joke.jpg (new provided image) as the site logo
const logoPath = "/joke.jpg";

export default function ChartViewer() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data,
    isLoading,
    error
  } = useTokenData(contractAddress);

  return (
    <div className="min-h-screen bg-background bg-trading-animation">
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse"></div>
              <div className="relative rounded-full p-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-gradient">
                <div className="rounded-full p-2 bg-background">
                  <img src={logoPath} alt="JACK boost" className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-600 to-red-400 animate-gradient">
            JACK boost
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Enhance your token visibility with our advanced volume generation system. Trusted by over 555+ projects to increase trading volume, create new holders, and achieve trading status.
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

            {data.isMigrated && data.pair ? (
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
            ) : (
              <UnmigratedTokenMessage />
            )}

            <Button className="w-full h-14 text-lg font-semibold" size="lg" onClick={() => setIsModalOpen(true)}>
              <TrendingUp className="mr-2 h-5 w-5" />
              Boost Volume
            </Button>

            <ServiceSelectionModal open={isModalOpen} onOpenChange={setIsModalOpen} contractAddress={contractAddress || ""} />
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
