import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createSchema } from './schema';
import { open } from "sqlite";
import sqlite3 from "sqlite3";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

    const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });
  await createSchema(db, false);
}
bootstrap();
