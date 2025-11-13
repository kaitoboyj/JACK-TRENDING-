import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TokenPair, ChartDataPoint } from "@/types/token";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

interface DexScreenerAPIChartProps {
  pair: TokenPair;
}

type TimeframeKey = "m5" | "h1" | "h6" | "h24";

interface Timeframe {
  label: string;
  key: TimeframeKey;
}

const TIMEFRAMES: Timeframe[] = [
  { label: "5m", key: "m5" },
  { label: "1h", key: "h1" },
  { label: "6h", key: "h6" },
  { label: "24h", key: "h24" },
];

export function DexScreenerAPIChart({ pair }: DexScreenerAPIChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("h24");
  const [priceHistory, setPriceHistory] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // Build historical data based on current data and price changes
    const now = Date.now();
    const currentPrice = parseFloat(pair.priceUsd);
    const priceChange = pair.priceChange[selectedTimeframe];

    // Calculate starting price based on percentage change
    const startPrice = currentPrice / (1 + priceChange / 100);

    // Create data points (simulated historical data)
    const dataPoints: ChartDataPoint[] = [];
    const numPoints = 20;

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const interpolatedPrice = startPrice + (currentPrice - startPrice) * progress;

      dataPoints.push({
        timestamp: now - (numPoints - i) * getTimeframeMs(selectedTimeframe) / numPoints,
        price: interpolatedPrice,
        volume: pair.volume[selectedTimeframe] / numPoints,
        buys: pair.txns[selectedTimeframe].buys / numPoints,
        sells: pair.txns[selectedTimeframe].sells / numPoints,
      });
    }

    setPriceHistory(dataPoints);
  }, [pair, selectedTimeframe]);

  function getTimeframeMs(timeframe: TimeframeKey): number {
    const ms = {
      m5: 5 * 60 * 1000,
      h1: 60 * 60 * 1000,
      h6: 6 * 60 * 60 * 1000,
      h24: 24 * 60 * 60 * 1000,
    };
    return ms[timeframe];
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const transactionData = [
    {
      name: "Buys",
      count: pair.txns[selectedTimeframe].buys,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Sells",
      count: pair.txns[selectedTimeframe].sells,
      fill: "hsl(var(--chart-2))",
    },
  ];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Price Chart (API Data)</h3>
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.key}
              variant={selectedTimeframe === tf.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf.key)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={formatPrice}
              stroke="hsl(var(--muted-foreground))"
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelFormatter={(value) => formatTime(value as number)}
              formatter={(value: number) => [`$${formatPrice(value)}`, "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">
          Transaction Stats ({TIMEFRAMES.find((tf) => tf.key === selectedTimeframe)?.label})
        </h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div>
          <div className="text-sm text-muted-foreground">Volume ({TIMEFRAMES.find((tf) => tf.key === selectedTimeframe)?.label})</div>
          <div className="text-lg font-semibold">
            ${pair.volume[selectedTimeframe].toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Price Change ({TIMEFRAMES.find((tf) => tf.key === selectedTimeframe)?.label})</div>
          <div
            className={`text-lg font-semibold ${
              pair.priceChange[selectedTimeframe] >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {pair.priceChange[selectedTimeframe] >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(pair.priceChange[selectedTimeframe]).toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
