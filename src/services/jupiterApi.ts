export interface JupiterTokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export async function searchJupiterToken(
  tokenAddress: string
): Promise<JupiterTokenInfo | null> {
  try {
    const response = await fetch(
      `https://tokens.jup.ag/token/${tokenAddress}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Jupiter API error:", error);
    return null;
  }
}
