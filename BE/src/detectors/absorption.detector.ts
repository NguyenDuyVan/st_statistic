import { Trade, Signal } from "../models/trade.model";

const PRICE_DROP_THRESHOLD = 0.1; // 0.1%
const SELL_VOLUME_MULTIPLIER = 3;

export function detectAbsorption(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  if (recentTrades.length < 5) return null;

  const avgVolume =
    recentTrades.reduce((s, t) => s + t.volume, 0) / recentTrades.length;

  const isLargeSell =
    trade.side === "sd" && trade.volume > avgVolume * SELL_VOLUME_MULTIPLIER;

  const priceDropPct = Math.abs(trade.priceChangePercent);

  if (isLargeSell && priceDropPct < PRICE_DROP_THRESHOLD) {
    return {
      type: "ABSORPTION",
      symbol: trade.symbol,
      price: trade.price,
      volume: trade.volume,
      value: trade.value,
      time: trade.time,
      timestamp: trade.timestamp,
      details: {
        largeSellVolume: trade.volume,
        avgVolume: Math.round(avgVolume),
        priceDropPercent: priceDropPct.toFixed(3),
        interpretation: "Large sell absorbed – price held",
      },
    };
  }

  return null;
}
