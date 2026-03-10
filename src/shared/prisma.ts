import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
  errorFormat: "minimal",
  transactionOptions: { maxWait: 50000, timeout: 60000 },
});

export default prisma;