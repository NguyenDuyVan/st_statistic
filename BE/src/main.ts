import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Stock Tracker BE running on http://localhost:${port}`);
}

bootstrap();
