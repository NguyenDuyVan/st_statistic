import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { Signal } from "../models/trade.model";

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private get botToken() {
    return process.env.TELEGRAM_BOT_TOKEN;
  }
  private get chatId() {
    return process.env.TELEGRAM_CHAT_ID;
  }

  async sendAlert(signal: Signal): Promise<void> {
    if (!this.botToken || !this.chatId) return;

    const valueBillion = (signal.value / 1_000_000_000).toFixed(2);

    const message = [
      `🚨 <b>SMART MONEY ALERT</b>`,
      ``,
      `Symbol: <b>${signal.symbol}</b>`,
      `Signal: <b>${signal.type}</b>`,
      ``,
      `Price: ${signal.price.toLocaleString("vi-VN")}`,
      `Volume: ${signal.volume.toLocaleString("vi-VN")}`,
      `Value: ${valueBillion}B`,
      ``,
      `Time: ${signal.time}`,
    ].join("\n");

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        { chat_id: this.chatId, text: message, parse_mode: "HTML" },
        { timeout: 5_000 },
      );
    } catch (err: any) {
      this.logger.warn(`Telegram alert failed: ${err.message}`);
    }
  }

  async sendTestMessage(): Promise<void> {
    if (!this.botToken || !this.chatId) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in .env",
      );
    }
    await axios.post(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        chat_id: this.chatId,
        text: "✅ <b>Telegram test message</b>\n\nYour bot is configured correctly!",
        parse_mode: "HTML",
      },
      { timeout: 5_000 },
    );
  }
}
