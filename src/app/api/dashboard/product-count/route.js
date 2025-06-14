import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {

  const uniqueCount = await prisma.product.count({
    where: { amount: { gt: 0 } },
  });

  const totalStockResult = await prisma.product.aggregate({
    _sum: { amount: true },
  });
  const totalStock = totalStockResult._sum.amount ?? 0;

  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(diff);

  const addedThisWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: startOfWeek,
      },
    },
  });

  return NextResponse.json({
    uniqueCount,
    totalStock,
    addedThisWeek,
  });
}
