import { Trade, Signal } from "../models/trade.model";

export function detectVolumeSpike(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  if (recentTrades.length < 5) return null;

  const avgVolume =
    recentTrades.reduce((s, t) => s + t.volume, 0) / recentTrades.length;

  if (avgVolume === 0) return null;

  const ratio = trade.volume / avgVolume;
  if (ratio < 5) return null;

  return {
    type: "VOLUME_SPIKE",
    symbol: trade.symbol,
    price: trade.price,
    volume: trade.volume,
    value: trade.value,
    time: trade.time,
    timestamp: trade.timestamp,
    details: {
      avgVolume: Math.round(avgVolume),
      ratio: ratio.toFixed(1),
      multiplier: `${ratio.toFixed(1)}x average`,
    },
  };
}
