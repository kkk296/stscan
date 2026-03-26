import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a simple random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Get session ID from cookies or generate new one
function getSessionId(request: Request): string {
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionMatch = cookieHeader.match(/sessionId=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : generateId();
}

export async function GET(request: Request) {
  const sessionId = getSessionId(request);

  try {
    const favorites = await db.favorite.findMany({
      where: { sessionId },
      include: {
        stock: {
          include: { stockData: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const response = NextResponse.json({ favorites });
    response.cookies.set('sessionId', sessionId, { 
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    // Check if already exists
    const existing = await db.favorite.findFirst({
      where: { sessionId, stockId: symbol },
    });

    if (existing) {
      // Remove from favorites
      await db.favorite.delete({ where: { id: existing.id } });
      const response = NextResponse.json({ 
        success: true, 
        action: 'removed',
        message: 'Removed from favorites' 
      });
      response.cookies.set('sessionId', sessionId, { 
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Add to favorites
    const stock = await db.stock.findUnique({ where: { symbol } });
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const favorite = await db.favorite.create({
      data: {
        sessionId,
        stockId: symbol,
      },
    });

    const response = NextResponse.json({ 
      success: true, 
      action: 'added',
      message: 'Added to favorites',
      favorite 
    });
    response.cookies.set('sessionId', sessionId, { 
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error managing favorite:', error);
    return NextResponse.json({ error: 'Failed to manage favorite' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionId = getSessionId(request);
  
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    await db.favorite.deleteMany({
      where: { sessionId, stockId: symbol },
    });

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
