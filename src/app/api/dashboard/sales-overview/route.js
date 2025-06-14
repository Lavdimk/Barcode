import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {

    const range = req.nextUrl.searchParams.get('range') ?? '7d';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let labels = [];
    let startDate = new Date(today);

    if (range === '1m') startDate.setMonth(startDate.getMonth() - 1);
    else if (range === '6m') startDate.setMonth(startDate.getMonth() - 5);
    else if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 6);

    const invoices = await prisma.invoice.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
            createdAt: true,
            totalPrice: true,
        },
    });

    const resultMap = new Map();

    if (range === '7d') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayNames = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'];
            labels.push(dayNames[d.getDay()]);
        }

        for (const label of labels) resultMap.set(label, 0);

        for (const invoice of invoices) {
            const d = new Date(invoice.createdAt);
            const dayLabel = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'][d.getDay()];
            resultMap.set(dayLabel, (resultMap.get(dayLabel) ?? 0) + invoice.totalPrice);
        }

        const todayLabel = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'][today.getDay()];
        const ordered = labels.filter(day => day !== todayLabel).concat(todayLabel);

        const result = ordered.map(day => ({
            day,
            value: Number((resultMap.get(day) ?? 0).toFixed(2)),
        }));

        return NextResponse.json(result);
    }

    if (range === '1m') {
        labels = ['Java 1', 'Java 2', 'Java 3', 'Java 4'];
        for (const label of labels) resultMap.set(label, 0);

        for (const invoice of invoices) {
            const date = new Date(invoice.createdAt);
            const week = Math.floor((date.getDate() - 1) / 7) + 1;
            const label = `Java ${week}`;
            resultMap.set(label, (resultMap.get(label) ?? 0) + invoice.totalPrice);
        }

        const result = labels.map(week => ({
            day: week,
            value: Number((resultMap.get(week) ?? 0).toFixed(2)),
        }));
        return NextResponse.json(result);
    }

    if (range === '6m' || range === '1y') {
        const monthNames = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
        const currentMonth = today.getMonth();
        const count = range === '6m' ? 6 : 12;

        for (let i = count - 1; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            labels.push(monthNames[monthIndex]);
        }

        for (const label of labels) resultMap.set(label, 0);

        for (const invoice of invoices) {
            const d = new Date(invoice.createdAt);
            const label = monthNames[d.getMonth()];
            resultMap.set(label, (resultMap.get(label) ?? 0) + invoice.totalPrice);
        }

        const result = labels.map(month => ({
            day: month,
            value: Number((resultMap.get(month) ?? 0).toFixed(2)),
        }));
        return NextResponse.json(result);
    }

    return NextResponse.json([]);
}
