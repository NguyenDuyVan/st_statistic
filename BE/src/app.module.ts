import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { TradeModule } from "./trade/trade.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    TradeModule,
  ],
})
export class AppModule {}
