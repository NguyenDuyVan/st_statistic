import { Injectable } from "@nestjs/common";
import { Trade, Signal } from "../models/trade.model";

type TradeCallback = (symbol: string, trade: Trade) => void;
type SignalCallback = (symbol: string, signal: Signal) => void;

@Injectable()
export class TradeStoreService {
  private readonly MAX_TRADES = 10_000;

  /** symbol → ordered list of trades */
  private trades = new Map<string, Trade[]>();
  /** symbol → set of dedup keys */
  private seenKeys = new Map<string, Set<string>>();
  /** signal store: symbol → last 100 signals */
  private signals = new Map<string, Signal[]>();

  private tradeCallbacks: TradeCallback[] = [];
  private signalCallbacks: SignalCallback[] = [];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private dedupKey(trade: Trade): string {
    return `${trade.symbol}|${trade.time}|${trade.price}|${trade.volume}`;
  }

  // ─── Trades ───────────────────────────────────────────────────────────────

  /** Returns true if trade was NEW (not a duplicate). */
  addTrade(trade: Trade): boolean {
    const key = this.dedupKey(trade);

    if (!this.seenKeys.has(trade.symbol)) {
      this.seenKeys.set(trade.symbol, new Set());
    }
    const seen = this.seenKeys.get(trade.symbol)!;
    if (seen.has(key)) return false;
    seen.add(key);

    if (!this.trades.has(trade.symbol)) {
      this.trades.set(trade.symbol, []);
    }
    const list = this.trades.get(trade.symbol)!;
    list.push(trade);

    // Trim to MAX_TRADES
    if (list.length > this.MAX_TRADES) {
      const removed = list.splice(0, list.length - this.MAX_TRADES);
      removed.forEach((t) => seen.delete(this.dedupKey(t)));
    }

    this.tradeCallbacks.forEach((cb) => cb(trade.symbol, trade));
    return true;
  }

  getTrades(symbol: string): Trade[] {
    return this.trades.get(symbol) ?? [];
  }

  getRecentTrades(symbol: string, count: number): Trade[] {
    return this.getTrades(symbol).slice(-count);
  }

  getSummary(symbol: string) {
    const list = this.getTrades(symbol);
    if (!list.length) return null;

    const buyVol = list
      .filter((t) => t.side === "bu")
      .reduce((s, t) => s + t.volume, 0);
    const sellVol = list
      .filter((t) => t.side === "sd")
      .reduce((s, t) => s + t.volume, 0);
    const totalValue = list.reduce((s, t) => s + t.value, 0);

    return {
      symbol,
      totalTrades: list.length,
      buyVolume: buyVol,
      sellVolume: sellVol,
      totalValue,
      latestPrice: list[list.length - 1]?.price,
      firstTime: list[0]?.time,
      lastTime: list[list.length - 1]?.time,
    };
  }

  exportAll(): Record<string, Trade[]> {
    const result: Record<string, Trade[]> = {};
    this.trades.forEach((v, k) => (result[k] = v));
    return result;
  }

  clearSymbol(symbol: string) {
    this.trades.delete(symbol);
    this.seenKeys.delete(symbol);
    this.signals.delete(symbol);
  }

  getSymbols(): string[] {
    return Array.from(this.trades.keys());
  }

  // ─── Signals ──────────────────────────────────────────────────────────────

  addSignal(signal: Signal) {
    if (!this.signals.has(signal.symbol)) {
      this.signals.set(signal.symbol, []);
    }
    const list = this.signals.get(signal.symbol)!;
    list.unshift(signal);
    if (list.length > 100) list.pop();

    this.signalCallbacks.forEach((cb) => cb(signal.symbol, signal));
  }

  getSignals(symbol: string): Signal[] {
    return this.signals.get(symbol) ?? [];
  }

  // ─── Pub/Sub ──────────────────────────────────────────────────────────────

  onNewTrade(cb: TradeCallback) {
    this.tradeCallbacks.push(cb);
  }

  onSignal(cb: SignalCallback) {
    this.signalCallbacks.push(cb);
  }
}
