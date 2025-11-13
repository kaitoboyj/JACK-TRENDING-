import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function UnmigratedTokenMessage() {
  return (
    <Card className="border-yellow-500/20 bg-card">
      <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <AlertCircle className="w-16 h-16 text-yellow-500 animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-green-500 animate-pulse tracking-wider">
            TOKEN NOT MIGRATED
          </h2>
          <p className="text-sm text-muted-foreground">
            CA ONLY - Chart will display when token is migrated to a DEX
          </p>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md">
          <p className="text-xs text-muted-foreground text-center">
            This token exists on-chain but hasn't been migrated to a decentralized exchange yet.
            Once migrated, full chart data and trading information will be available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
