import { PrismaClient } from '@prisma/client'
import { applyCors } from '@/app/helpers/cors'

const prisma = new PrismaClient()

export async function POST(req) {
  await applyCors(req, res);
  try {
    const body = await req.json()
    console.log('Request body:', body)

    const product = await prisma.product.create({
      data: {
        barcode: body.barcode,
        name: body.name,
        amount: body.amount,
        price: body.price,
      },
    })

    return new Response(JSON.stringify(product), { status: 201 })
  } catch (error) {
    console.error('Gabim API:', error)
    return new Response('Gabim gjatë shtimit të produktit', { status: 500 })
  }
}
export async function GET(req) {
  await applyCors(req, res);
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');

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
    } else {
      const products = await prisma.product.findMany();

      return new Response(JSON.stringify(products), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response('Error retrieving product(s)', { status: 500 });
  }
}


export async function DELETE(req) {
  await applyCors(req, res);
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
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        barcode: body.barcode,
        amount: body.amount,
        price: body.price,
      },
    });

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error updating product", { status: 500 });
  }
}

