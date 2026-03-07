import { Trade, Signal } from "../models/trade.model";

const BUY_PRESSURE_RATIO = 2;

export function detectBuyPressure(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  if (recentTrades.length < 10) return null;

  const last30 = recentTrades.slice(-30);

  const buyVolume = last30
    .filter((t) => t.side === "bu")
    .reduce((s, t) => s + t.volume, 0);

  const sellVolume = last30
    .filter((t) => t.side === "sd")
    .reduce((s, t) => s + t.volume, 0);

  if (sellVolume === 0) return null;

  const ratio = buyVolume / sellVolume;
  if (ratio < BUY_PRESSURE_RATIO) return null;

  return {
    type: "BUY_PRESSURE",
    symbol: trade.symbol,
    price: trade.price,
    volume: trade.volume,
    value: trade.value,
    time: trade.time,
    timestamp: trade.timestamp,
    details: {
      buyVolume,
      sellVolume,
      ratio: ratio.toFixed(2),
      period: "last 30 trades",
    },
  };
}
