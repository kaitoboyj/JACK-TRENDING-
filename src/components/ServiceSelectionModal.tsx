import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractAddress: string;
}

export function ServiceSelectionModal({ open, onOpenChange, contractAddress }: ServiceSelectionModalProps) {
  const navigate = useNavigate();

  const handleBoostVolume = () => {
    onOpenChange(false);
    navigate(`/boost-volume/${contractAddress}`);
  };

  const handleBoostTransactions = () => {
    onOpenChange(false);
    navigate(`/boost-transactions/${contractAddress}`);
  };

  const handleRunAds = () => {
    onOpenChange(false);
    navigate(`/run-ads/${contractAddress}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleBoostVolume}
            size="lg"
            className="w-full h-16 text-lg font-semibold"
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            BOOST VOLUME
          </Button>

          <Button
            onClick={handleBoostTransactions}
            size="lg"
            className="w-full h-16 text-lg font-semibold"
          >
            <Activity className="mr-2 h-5 w-5" />
            BOOST TRANSACTION COUNT
          </Button>

          <Button
            onClick={handleRunAds}
            size="lg"
            className="w-full h-16 text-lg font-semibold"
          >
            <Megaphone className="mr-2 h-5 w-5" />
            RUN ADDS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
