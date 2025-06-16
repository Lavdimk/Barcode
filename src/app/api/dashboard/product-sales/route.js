import { PrismaClient } from '@prisma/client';
import { startOfDay, subWeeks, subMonths, subYears, format, differenceInCalendarWeeks } from 'date-fns';
import { toLocalDate } from '../../../helpers/dateHelper';

const prisma = new PrismaClient();

const sqDays = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');

  const now = new Date();
  let fromDate = new Date();
  let groupBy = 'hour';
  let formatStr = 'H';
  let bins = 24;
  let reorderedDays = [];

  switch (period) {
    case 'Today':
      fromDate = startOfDay(now);
      groupBy = 'hour';
      formatStr = 'H';
      bins = 24;
      break;

    case '1 week':
      fromDate = subWeeks(now, 1);
      groupBy = 'day';
      bins = 7;

      const todayIndex = now.getDay();
      reorderedDays = [...sqDays.slice(todayIndex + 1), ...sqDays.slice(0, todayIndex + 1)];
      break;

    case '1 month':
      fromDate = subMonths(now, 1);
      groupBy = 'week';
      bins = 4;
      break;

    case '1 year':
      fromDate = subYears(now, 1);
      groupBy = 'month';
      formatStr = 'M';
      bins = 12;
      break;

    default:
      fromDate = startOfDay(now);
  }

  const invoices = await prisma.invoiceItem.findMany({
    where: {
      invoice: {
        createdAt: {
          gte: fromDate,
          lte: now,
        },
      },
    },
    include: {
      invoice: true,
    },
  });

  let grouped = Array.from({ length: bins }, () => ({ value: 0 }));

  invoices.forEach(item => {
    const createdAt = toLocalDate(item.invoice.createdAt);
    let index;

    if (groupBy === 'week') {
      const diff = differenceInCalendarWeeks(now, createdAt);
      index = bins - 1 - diff;

      if (index < 0 || index >= bins) return;
    }
    else if (groupBy === 'month') {
      const key = parseInt(format(createdAt, formatStr));
      index = key - 1;
    } else if (groupBy === 'day') {
      const dayIndex = createdAt.getDay();
      const label = sqDays[dayIndex];
      index = reorderedDays.indexOf(label);
      if (index === -1) return;
    } else {
      const key = parseInt(format(createdAt, formatStr));
      index = key % bins;
    }

    grouped[index].value += item.amount;
  });

  if (period === '1 week') {
    return new Response(
      JSON.stringify({
        grouped: reorderedDays.map((label, idx) => ({
          day: label,
          value: grouped[idx].value,
        })),
        totalQuantity: invoices.reduce((sum, item) => sum + item.amount, 0),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      grouped,
      totalQuantity: invoices.reduce((sum, item) => sum + item.amount, 0),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
} 