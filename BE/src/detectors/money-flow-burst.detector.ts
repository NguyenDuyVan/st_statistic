import { Trade, Signal } from "../models/trade.model";

const BURST_THRESHOLD = 10_000_000_000; // 10B

export function detectMoneyFlowBurst(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  // Include current trade in last-5 calculation
  const last5 = [...recentTrades.slice(-4), trade];
  if (last5.length < 3) return null;

  const totalValue = last5.reduce((s, t) => s + t.value, 0);

  if (totalValue < BURST_THRESHOLD) return null;

  return {
    type: "MONEY_FLOW_BURST",
    symbol: trade.symbol,
    price: trade.price,
    volume: trade.volume,
    value: trade.value,
    time: trade.time,
    timestamp: trade.timestamp,
    details: {
      totalValue5Trades: totalValue,
      totalValueBillion: (totalValue / 1e9).toFixed(2),
    },
  };
}
