import { Trade, Signal } from "../models/trade.model";

const FIVE_MINUTES_MS = 5 * 60 * 1_000;
const VOLUME_MULTIPLIER = 3;

export function detectBreakout(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  if (recentTrades.length < 10) return null;

  // Highest price in the last 5 minutes (excluding current trade)
  const fiveMinAgo = trade.timestamp - FIVE_MINUTES_MS;
  const recent5Min = recentTrades.filter((t) => t.timestamp >= fiveMinAgo);

  if (recent5Min.length < 3) return null;

  const highestPrice = Math.max(...recent5Min.map((t) => t.price));

  const avgVolume =
    recentTrades.reduce((s, t) => s + t.volume, 0) / recentTrades.length;

  if (
    trade.price > highestPrice &&
    trade.volume > avgVolume * VOLUME_MULTIPLIER
  ) {
    return {
      type: "BREAKOUT",
      symbol: trade.symbol,
      price: trade.price,
      volume: trade.volume,
      value: trade.value,
      time: trade.time,
      timestamp: trade.timestamp,
      details: {
        highestPrice5Min: highestPrice,
        breakoutBy: trade.price - highestPrice,
        avgVolume: Math.round(avgVolume),
      },
    };
  }

  return null;
}
