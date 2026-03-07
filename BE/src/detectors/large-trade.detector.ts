import { Trade, Signal } from "../models/trade.model";

const LARGE_VOLUME = 100_000;
const LARGE_VALUE = 3_000_000_000;

export function detectLargeTrade(trade: Trade): Signal | null {
  if (trade.volume < LARGE_VOLUME && trade.value < LARGE_VALUE) return null;

  return {
    type: "LARGE_TRADE",
    symbol: trade.symbol,
    price: trade.price,
    volume: trade.volume,
    value: trade.value,
    time: trade.time,
    timestamp: trade.timestamp,
    details: {
      reason:
        trade.volume >= LARGE_VOLUME
          ? `Volume ${trade.volume.toLocaleString()} ≥ 100,000`
          : `Value ${(trade.value / 1e9).toFixed(2)}B ≥ 3B`,
    },
  };
}
