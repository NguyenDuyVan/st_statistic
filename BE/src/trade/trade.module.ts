import { Module } from "@nestjs/common";
import { TradeController } from "./trade.controller";
import { TradeGateway } from "./trade.gateway";
import { PollingService } from "../services/polling.service";
import { TradeStoreService } from "../services/trade-store.service";
import { DetectorService } from "../services/detector.service";
import { TelegramService } from "../services/telegram.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TradeController],
  providers: [
    TradeGateway,
    TradeStoreService,
    DetectorService,
    TelegramService,
    PollingService,
  ],
  exports: [TradeStoreService, PollingService],
})
export class TradeModule {}
