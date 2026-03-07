export interface Trade {
  symbol: string;
  price: number;
  volume: number;
  value: number;
  accumulatedVolume: number;
  priceChange: number;
  priceChangePercent: number;
  /** 'bu' = buy-initiated, 'sd' = sell-initiated, 'u' = unknown */
  side: string;
  time: string;
  timestamp: number;
}

export interface Signal {
  type: SignalType;
  symbol: string;
  price: number;
  volume: number;
  value: number;
  time: string;
  timestamp: number;
  details?: Record<string, any>;
}

export type SignalType =
  | "LARGE_TRADE"
  | "VOLUME_SPIKE"
  | "MONEY_FLOW_BURST"
  | "BUY_PRESSURE"
  | "BREAKOUT"
  | "ABSORPTION"
  | "ICEBERG";
