import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import axios from "axios";
import { TradeStoreService } from "./trade-store.service";
import { DetectorService } from "./detector.service";
import { Trade } from "../models/trade.model";

@Injectable()
export class PollingService implements OnModuleDestroy {
  private readonly logger = new Logger(PollingService.name);
  private intervalHandles = new Map<string, NodeJS.Timeout>();
  private _isTracking = false;
  private _trackedSymbols: string[] = [];

  constructor(
    private readonly tradeStore: TradeStoreService,
    private readonly detector: DetectorService,
  ) {}

  get isTracking() {
    return this._isTracking;
  }
  get trackedSymbols() {
    return [...this._trackedSymbols];
  }

  startTracking(symbols: string[]) {
    this.stopTracking();

    this._trackedSymbols = symbols.map((s) => s.toUpperCase());
    this._isTracking = true;

    for (const symbol of this._trackedSymbols) {
      // Immediate first poll
      this.pollSymbol(symbol);
      const handle = setInterval(() => this.pollSymbol(symbol), 1_000);
      this.intervalHandles.set(symbol, handle);
    }

    this.logger.log(`🔍 Tracking started: ${this._trackedSymbols.join(", ")}`);
  }

  stopTracking() {
    this.intervalHandles.forEach((h) => clearInterval(h));
    this.intervalHandles.clear();
    this._isTracking = false;
    this._trackedSymbols = [];
    this.logger.log("⏹ Tracking stopped");
  }

  private async pollSymbol(symbol: string) {
    try {
      const { data } = await axios.get(
        `https://iboard-query.ssi.com.vn/le-table/stock/${symbol}`,
        {
          timeout: 4_000,
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8",
            referer: "https://iboard.ssi.com.vn/",
            origin: "https://iboard.ssi.com.vn",
          },
        },
      );

      if (!data) return;

      const items: any[] = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (!item) continue;

        const trade: Trade = {
          symbol,
          price: item.price ?? item.p ?? 0,
          volume: item.vol ?? item.volume ?? 0,
          value: item.val ?? item.value ?? 0,
          accumulatedVolume: item.accumulatedVol ?? item.accVol ?? 0,
          priceChange: item.priceChange ?? item.pchg ?? 0,
          priceChangePercent: item.priceChangePercent ?? item.pchgPercent ?? 0,
          side: item.side ?? "u",
          time: item.time ?? "",
          timestamp: Date.now(),
        };

        const isNew = this.tradeStore.addTrade(trade);

        if (isNew) {
          const recent = this.tradeStore.getRecentTrades(symbol, 30);
          const signals = this.detector.detect(trade, recent);
          signals.forEach((sig) => this.tradeStore.addSignal(sig));
        }
      }
    } catch {
      // Silent fail – network/API errors are expected during polling
    }
  }

  onModuleDestroy() {
    this.stopTracking();
  }
}
