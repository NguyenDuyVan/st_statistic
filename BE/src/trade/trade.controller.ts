import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { PollingService } from "../services/polling.service";
import { TradeStoreService } from "../services/trade-store.service";
import { TelegramService } from "../services/telegram.service";
import * as fs from "fs";
import * as path from "path";
@UseGuards(JwtAuthGuard)
@Controller("tracker")
export class TradeController {
  constructor(
    private readonly polling: PollingService,
    private readonly tradeStore: TradeStoreService,
    private readonly telegram: TelegramService,
  ) {}

  @Post("start")
  start(@Body() body: { symbols: string[] }) {
    const symbols = (body.symbols ?? []).map((s) => s.toUpperCase());
    this.polling.startTracking(symbols);
    return { message: "Tracking started", symbols };
  }

  @Post("stop")
  @HttpCode(200)
  stop() {
    this.polling.stopTracking();
    return { message: "Tracking stopped" };
  }

  @Get("status")
  status() {
    return {
      isTracking: this.polling.isTracking,
      symbols: this.polling.trackedSymbols,
    };
  }

  @Get("trades/:symbol")
  getTrades(@Param("symbol") symbol: string) {
    return this.tradeStore.getTrades(symbol.toUpperCase());
  }

  @Get("signals/:symbol")
  getSignals(@Param("symbol") symbol: string) {
    return this.tradeStore.getSignals(symbol.toUpperCase());
  }

  @Get("summary/:symbol")
  getSummary(@Param("symbol") symbol: string) {
    return this.tradeStore.getSummary(symbol.toUpperCase());
  }

  @Post("export")
  @HttpCode(200)
  export() {
    const data = this.tradeStore.exportAll();
    const filename = `trades_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const exportDir = path.join(process.cwd(), "exports");

    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportPath = path.join(exportDir, filename);
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), "utf-8");

    return { message: "Exported", filename, path: exportPath, data };
  }

  @Delete("clear/:symbol")
  clear(@Param("symbol") symbol: string) {
    this.tradeStore.clearSymbol(symbol.toUpperCase());
    return { message: `Cleared ${symbol.toUpperCase()}` };
  }

  @Post("test-telegram")
  @HttpCode(200)
  async testTelegram() {
    try {
      await this.telegram.sendTestMessage();
      return { success: true, message: "Test message sent successfully" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
