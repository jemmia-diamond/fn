// @ts-expect-error ignore missing prisma config type
import { defineConfig } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./schema.prisma",
  datasource: {
    // @ts-expect-error ignore missing process type
    url: process.env.DATABASE_URL
  }
});
