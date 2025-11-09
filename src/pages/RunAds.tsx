import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTokenData } from "@/hooks/useTokenData";
import { TokenInfo } from "@/components/TokenInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const AD_PACKAGES = [
  { sol: 1, duration: "4 hours" },
  { sol: 2, duration: "8 hours" },
  { sol: 3, duration: "12 hours" },
  { sol: 4, duration: "15 hours" },
  { sol: 10, duration: "24 hours" },
  { sol: 15, duration: "2 days" },
  { sol: 25, duration: "1 week" },
];

export default function RunAds() {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTokenData(contractAddress || null);
  const [selectedPackage, setSelectedPackage] = useState<{ sol: number; duration: string } | null>(null);
  const [projectDescription, setProjectDescription] = useState("");

  const handlePackageSelect = (sol: number, duration: string) => {
    setSelectedPackage({ sol, duration });
    toast({
      title: "Package Selected",
      description: `${sol} SOL - ${duration} package selected.`,
    });
  };

  const handleInitializeAds = () => {
    toast({
      title: "Initializing Ads",
      description: `Starting ad campaign for ${selectedPackage?.sol} SOL package...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chart
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Trending Trading</h1>
          <p className="text-muted-foreground">
            Choose a package to run ads for your token
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
                {AD_PACKAGES.map((pkg, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePackageSelect(pkg.sol, pkg.duration)}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-lg font-bold">{pkg.sol} SOL</span>
                    <span className="text-sm text-muted-foreground">
                      {pkg.duration}
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
                  alt="Project Logo" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="w-full space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleInitializeAds}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                INITIALIZE ADS
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
