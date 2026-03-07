import { Trade, Signal } from "../models/trade.model";

const ICEBERG_WINDOW_MS = 5_000; // 5 seconds
const ICEBERG_MIN_TRADES = 10;

export function detectIceberg(
  trade: Trade,
  recentTrades: Trade[],
): Signal | null {
  const windowStart = trade.timestamp - ICEBERG_WINDOW_MS;

  const samePrice = recentTrades.filter(
    (t) => t.price === trade.price && t.timestamp >= windowStart,
  );

  if (samePrice.length < ICEBERG_MIN_TRADES - 1) return null;

  const avgVolume =
    samePrice.reduce((s, t) => s + t.volume, 0) / samePrice.length;

  return {
    type: "ICEBERG",
    symbol: trade.symbol,
    price: trade.price,
    volume: trade.volume,
    value: trade.value,
    time: trade.time,
    timestamp: trade.timestamp,
    details: {
      tradesAtSamePrice: samePrice.length,
      avgVolumePerTrade: Math.round(avgVolume),
      windowSeconds: ICEBERG_WINDOW_MS / 1000,
      interpretation: "Hidden large order split into small pieces",
    },
  };
}
