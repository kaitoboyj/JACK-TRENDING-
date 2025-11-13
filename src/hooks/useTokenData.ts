import { useQuery } from "@tanstack/react-query";
import { getTokenData } from "@/services/dexscreenerApi";
import { searchJupiterToken } from "@/services/jupiterApi";
import { TokenInfo, TokenPair } from "@/types/token";

function transformTokenData(pair: TokenPair): TokenInfo {
  return {
    name: pair.baseToken?.name || "Unknown",
    symbol: pair.baseToken?.symbol || "???",
    logo: pair.info?.imageUrl || "",
    address: pair.baseToken?.address || "",
    price: parseFloat(pair.priceUsd || "0"),
    priceChange24h: pair.priceChange?.h24 ?? 0,
    volume24h: pair.volume?.h24 ?? 0,
    marketCap: pair.marketCap ?? 0,
    liquidity: pair.liquidity?.usd ?? 0,
    fdv: pair.fdv ?? 0,
    dex: pair.dexId || "unknown",
    chain: pair.chainId || "solana",
    socialLinks: {
      website: pair.info?.websites?.[0]?.url,
      twitter: pair.info?.socials?.find((s) => s.type === "twitter")?.url,
      telegram: pair.info?.socials?.find((s) => s.type === "telegram")?.url,
      discord: pair.info?.socials?.find((s) => s.type === "discord")?.url,
    },
    pairAddress: pair.pairAddress || "",
    createdAt: pair.pairCreatedAt || 0,
    buys24h: pair.txns?.h24?.buys ?? 0,
    sells24h: pair.txns?.h24?.sells ?? 0,
  };
}

function isTokenMigrated(pair: TokenPair): boolean {
  return !!(
    pair.liquidity?.usd &&
    pair.liquidity.usd > 0 &&
    pair.volume?.h24 !== undefined &&
    pair.pairAddress
  );
}

export function useTokenData(tokenAddress: string | null) {
  return useQuery({
    queryKey: ["tokenData", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) throw new Error("No token address provided");
      
      // Try DexScreener first
      const data = await getTokenData(tokenAddress);
      
      if (!data.pairs || data.pairs.length === 0) {
        // Try Jupiter as fallback for unmigrated tokens
        const jupiterData = await searchJupiterToken(tokenAddress);
        
        if (jupiterData) {
          const jupiterTokenInfo: TokenInfo = {
            name: jupiterData.name || "Unknown",
            symbol: jupiterData.symbol || "???",
            logo: jupiterData.logoURI || "",
            address: jupiterData.address || tokenAddress,
            price: 0,
            priceChange24h: 0,
            volume24h: 0,
            marketCap: 0,
            liquidity: 0,
            fdv: 0,
            dex: "jupiter",
            chain: "solana",
            socialLinks: {},
            pairAddress: "",
            createdAt: 0,
            buys24h: 0,
            sells24h: 0,
          };
          
          return {
            pair: null,
            tokenInfo: jupiterTokenInfo,
            isMigrated: false,
            source: "jupiter",
          };
        }
        
        throw new Error("Token not found on DexScreener or Jupiter");
      }
      
      // Get the pair with highest liquidity (usually the main pair)
      const mainPair = data.pairs.reduce((prev, current) => {
        const prevLiq = prev.liquidity?.usd ?? 0;
        const currLiq = current.liquidity?.usd ?? 0;
        return prevLiq > currLiq ? prev : current;
      });

      const isMigrated = isTokenMigrated(mainPair);

      return {
        pair: mainPair,
        tokenInfo: transformTokenData(mainPair),
        isMigrated,
        source: "dexscreener",
      };
    },
    enabled: !!tokenAddress,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
