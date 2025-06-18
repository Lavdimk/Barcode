import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export async function GET() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notifications);
}

export async function POST(req) {
  const { message } = await req.json();

  if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

  const newNotification = await prisma.notification.create({
    data: { message },
  });

  return NextResponse.json(newNotification);
}

export async function PATCH(req) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updated = await prisma.notification.update({
    where: { id: Number(id) },
    data: { read: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    await prisma.notification.delete({
      where: { id: Number(id) },
    });
  } else {
    await prisma.notification.deleteMany();
  }

  return NextResponse.json({ success: true });
}
