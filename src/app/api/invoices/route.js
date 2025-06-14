import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server'


const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { products, totalPrice } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response("Produkte të pavlefshme", { status: 400 });
    }

    const insufficientStockProducts = [];

    for (const p of products) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: p.id }
      });

      if (!dbProduct) continue;

      if (dbProduct.amount < p.amount) {
        insufficientStockProducts.push({
          name: dbProduct.name,
          available: dbProduct.amount,
          requested: p.amount
        });
      }
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          totalPrice,
          items: {
            create: products.map((p) => ({
              productId: p.id,
              amount: p.amount,
              price: p.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const p of products) {
        const dbProduct = await tx.product.findUnique({
          where: { id: p.id },
        });

        if (!dbProduct) continue;

        const decrementAmount = Math.min(p.amount, dbProduct.amount);

        if (decrementAmount > 0) {
          await tx.product.update({
            where: { id: p.id },
            data: {
              amount: {
                decrement: decrementAmount
              }
            }
          });
        }
      }

      return newInvoice;
    });

    return new Response(JSON.stringify({
      invoice,
      insufficientStockProducts
    }), { status: 201 });

  } catch (error) {
    console.error("Gabim gjatë ruajtjes së faturës:", error);
    return new Response("Gabim gjatë ruajtjes së faturës", { status: 500 });
  }
}


export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(invoices ?? [])

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gabim gjatë marrjes së faturave.' }, { status: 500 })
  }
}
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const invoiceId = searchParams.get('id');

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const invoicesToDelete = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          }
        }
      });

      const invoiceIds = invoicesToDelete.map(inv => inv.id);

      await prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: { in: invoiceIds }
        }
      });

      await prisma.invoice.deleteMany({
        where: {
          id: { in: invoiceIds }
        }
      });

      return NextResponse.json({ message: `Faturat e dates ${date} u fshinë.` });
    } else if (invoiceId) {
      const id = parseInt(invoiceId);

      await prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: id
        }
      });

      await prisma.invoice.delete({
        where: {
          id: id
        }
      });

      return NextResponse.json({ message: `Fatura me id ${id} u fshi.` });
    } else {
      return new Response('Nuk u dhanë parametrat e nevojshëm', { status: 400 });
    }

  } catch (error) {
    console.error('Gabim gjatë fshirjes së faturave:', error);
    return new Response('Gabim gjatë fshirjes së faturave', { status: 500 });
  }
}