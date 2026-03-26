import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET endpoint to get stock data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  try {
    const stock = await db.stock.findUnique({
      where: { symbol },
      include: { stockData: true },
    });

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json({ stock });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}

// POST endpoint to update stock OHLC data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, ...ohlcData } = body;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    const stock = await db.stock.findUnique({ where: { symbol } });
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Update or create stock data
    const updatedData = await db.stockData.upsert({
      where: { stockId: symbol },
      update: {
        ...ohlcData,
        lastUpdated: new Date(),
      },
      create: {
        stockId: symbol,
        ...ohlcData,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Stock data updated',
      data: updatedData 
    });
  } catch (error) {
    console.error('Error updating stock data:', error);
    return NextResponse.json({ error: 'Failed to update stock data' }, { status: 500 });
  }
}
