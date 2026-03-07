import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { TradeStoreService } from "../services/trade-store.service";
import { AuthService } from "../auth/auth.service";
@WebSocketGateway({
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
})
export class TradeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TradeGateway.name);

  constructor(
    private readonly tradeStore: TradeStoreService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    // Forward new trades and signals to all connected WebSocket clients
    this.tradeStore.onNewTrade((symbol, trade) => {
      server.emit("new-trade", { symbol, trade });
    });

    this.tradeStore.onSignal((symbol, signal) => {
      server.emit("signal", { symbol, signal });
    });

    this.logger.log("WebSocket gateway initialised");
  }

  handleConnection(client: Socket) {
    // Validate token from handshake (query or auth header)
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string);

    if (!token) {
      this.logger.warn(`WS rejected (no token): ${client.id}`);
      client.emit("auth-error", "Missing token");
      client.disconnect(true);
      return;
    }

    try {
      this.authService.verifyToken(token);
      this.logger.debug(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`WS rejected (invalid token): ${client.id}`);
      client.emit("auth-error", "Invalid token");
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /** Client can request historical trades for a symbol */
  @SubscribeMessage("get-trades")
  handleGetTrades(@MessageBody() symbol: string) {
    return this.tradeStore.getTrades((symbol ?? "").toUpperCase());
  }

  /** Client can request historical signals for a symbol */
  @SubscribeMessage("get-signals")
  handleGetSignals(@MessageBody() symbol: string) {
    return this.tradeStore.getSignals((symbol ?? "").toUpperCase());
  }
}
