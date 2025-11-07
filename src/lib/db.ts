import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

/**
 * 개발 단계에서 Hot Reloading 발생 시 항상 새로운 PrismaClient 인스턴스가 생성되는 문제를 방지하기 위해
 * 개발 환경에서는 globalForPrisma.prisma에 할당합니다.
 */
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
