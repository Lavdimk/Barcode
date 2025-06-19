import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        barcode: body.barcode,
        name: body.name,
        amount: body.amount,
        price: body.price,
        isWeight: body.isWeight ?? false,
      },
    });

    return new Response(JSON.stringify(product), { status: 201 });
  } catch (error) {
    console.error('Gabim API:', error);
    return new Response('Gabim gjatë shtimit të produktit', { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');
    const searchQuery = searchParams.get('search') || '';
    const amount = searchParams.get('amount');
    const amountRange = searchParams.get('amountRange');
    const isWeight = searchParams.get('isWeight');


    if (barcode) {
      const product = await prisma.product.findUnique({
        where: { barcode }
      });

      if (!product) {
        return new Response('Product not found', { status: 404 });
      }

      return new Response(JSON.stringify(product), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const where = { AND: [] };

    if (searchQuery) {
      where.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { barcode: { contains: searchQuery, mode: 'insensitive' } },
        ],
      });
    }
    if (isWeight === 'true') {
      where.AND.push({ isWeight: true });
    }


    if (amount === '0' && amountRange === '1-5') {
      where.AND.push({
        OR: [
          { amount: 0 },
          {
            amount: {
              gte: 1,
              lte: 5,
            },
          },
        ],
      });
    } else if (amount === '0') {
      where.AND.push({ amount: 0 });
    } else if (amountRange === '1-5') {
      where.AND.push({
        amount: {
          gte: 1,
          lte: 5,
        },
      });
    }


    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return new Response(JSON.stringify({ products, total }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response('Error retrieving product(s)', { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    return new Response("Product deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting product", { status: 500 });
  }
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();

  try {
    const prevProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!prevProduct) {
      return new Response("Produkti nuk u gjet", { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        barcode: body.barcode,
        amount: body.amount,
        price: body.price,
      },
    });

    if (prevProduct.amount === 0 && updatedProduct.amount > 0) {
      await prisma.notification.deleteMany({
        where: {
          message: {
            contains: updatedProduct.name,
          },
          read: false,
        },
      });
    }

    return new Response(JSON.stringify(updatedProduct), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response("Error updating product", { status: 500 });
  }
}


export async function PATCH(req) {
  const { id, amount } = await req.json();
  console.log('PATCH /api/products body:', { id, amount });

  if (!id || amount === undefined) {
    return NextResponse.json({ error: 'Id dhe amount janë të nevojshme' }, { status: 400 });
  }

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: { amount },
  });

  if (updatedProduct.amount === 0) {
    const existing = await prisma.notification.findFirst({
      where: {
        message: {
          contains: updatedProduct.name,
        },
        read: false,
      },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          message: `Produkti "${updatedProduct.name}" ka rënë në 0 stok.`,
        },
      });
    }
  }

  return NextResponse.json(updatedProduct);
}