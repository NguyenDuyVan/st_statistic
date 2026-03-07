import { Injectable } from "@nestjs/common";
import { Trade, Signal } from "../models/trade.model";
import { detectLargeTrade } from "../detectors/large-trade.detector";
import { detectVolumeSpike } from "../detectors/volume-spike.detector";
import { detectMoneyFlowBurst } from "../detectors/money-flow-burst.detector";
import { detectBuyPressure } from "../detectors/buy-pressure.detector";
import { detectBreakout } from "../detectors/breakout.detector";
import { detectAbsorption } from "../detectors/absorption.detector";
import { detectIceberg } from "../detectors/iceberg.detector";
import { TelegramService } from "./telegram.service";

/** Cooldown: 30 seconds per (symbol + signal type) */
const COOLDOWN_MS = 30_000;

@Injectable()
export class DetectorService {
  private cooldowns = new Map<string, number>();

  constructor(private readonly telegram: TelegramService) {}

  detect(trade: Trade, recentTrades: Trade[]): Signal[] {
    const detectors = [
      () => detectLargeTrade(trade),
      () => detectVolumeSpike(trade, recentTrades),
      () => detectMoneyFlowBurst(trade, recentTrades),
      () => detectBuyPressure(trade, recentTrades),
      () => detectBreakout(trade, recentTrades),
      () => detectAbsorption(trade, recentTrades),
      () => detectIceberg(trade, recentTrades),
    ];

    const signals: Signal[] = [];

    for (const fn of detectors) {
      const signal = fn();
      if (signal && this.isCooldownReady(signal)) {
        signals.push(signal);
        this.telegram.sendAlert(signal).catch(() => {});
      }
    }

    return signals;
  }

  private isCooldownReady(signal: Signal): boolean {
    const key = `${signal.symbol}:${signal.type}`;
    const last = this.cooldowns.get(key) ?? 0;
    const now = Date.now();
    if (now - last < COOLDOWN_MS) return false;
    this.cooldowns.set(key, now);
    return true;
  }
}
