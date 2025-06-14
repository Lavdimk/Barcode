import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    const topProducts = await prisma.invoiceItem.groupBy({
        by: ['productId'],
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: 'desc',
            },
        },
        take: 5,
    });

    const withNames = await Promise.all(
        topProducts.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true },
            });

            return {
                name: product?.name ?? 'Unknown',
                value: item._sum.amount ?? 0,
            };
        })
    );

    return NextResponse.json(withNames);
}
