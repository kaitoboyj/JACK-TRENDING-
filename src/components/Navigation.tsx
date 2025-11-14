import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "react-router-dom";
// Use public joke.jpg (new provided image) as the site logo
const logoPath = "/joke.jpg";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoPath} alt="JACK boost" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              JACK boost
            </span>
          </Link>
          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
