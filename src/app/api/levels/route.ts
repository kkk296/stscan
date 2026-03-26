import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Pivot Point Calculation Types
export type PivotType = 'classic' | 'fibonacci' | 'camarilla' | 'woodie' | 'demark' | 'custom';
export type CalculationSource = 'prevDay' | 'prevWeek' | 'prevMonth' | 'today' | 'custom';

interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PivotLevels {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  r4?: number;
  s1: number;
  s2: number;
  s3: number;
  s4?: number;
  type: string;
}

// Classic Pivot Points
function calculateClassicPivots(ohlc: OHLCData): PivotLevels {
  const { high, low, close } = ohlc;
  const pivot = (high + low + close) / 3;
  const range = high - low;
  
  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round((2 * pivot - low) * 100) / 100,
    r2: Math.round((pivot + range) * 100) / 100,
    r3: Math.round((pivot + 2 * range) * 100) / 100,
    s1: Math.round((2 * pivot - high) * 100) / 100,
    s2: Math.round((pivot - range) * 100) / 100,
    s3: Math.round((pivot - 2 * range) * 100) / 100,
    type: 'Classic',
  };
}

// Fibonacci Pivot Points
function calculateFibonacciPivots(ohlc: OHLCData): PivotLevels {
  const { high, low, close } = ohlc;
  const pivot = (high + low + close) / 3;
  const range = high - low;
  
  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round((pivot + 0.382 * range) * 100) / 100,
    r2: Math.round((pivot + 0.618 * range) * 100) / 100,
    r3: Math.round((pivot + 1.0 * range) * 100) / 100,
    s1: Math.round((pivot - 0.382 * range) * 100) / 100,
    s2: Math.round((pivot - 0.618 * range) * 100) / 100,
    s3: Math.round((pivot - 1.0 * range) * 100) / 100,
    type: 'Fibonacci',
  };
}

// Camarilla Pivot Points
function calculateCamarillaPivots(ohlc: OHLCData): PivotLevels {
  const { high, low, close } = ohlc;
  const range = high - low;
  
  return {
    pivot: Math.round(close * 100) / 100,
    r1: Math.round((close + range * 1.1 / 12) * 100) / 100,
    r2: Math.round((close + range * 1.1 / 6) * 100) / 100,
    r3: Math.round((close + range * 1.1 / 4) * 100) / 100,
    r4: Math.round((close + range * 1.1 / 2) * 100) / 100,
    s1: Math.round((close - range * 1.1 / 12) * 100) / 100,
    s2: Math.round((close - range * 1.1 / 6) * 100) / 100,
    s3: Math.round((close - range * 1.1 / 4) * 100) / 100,
    s4: Math.round((close - range * 1.1 / 2) * 100) / 100,
    type: 'Camarilla',
  };
}

// Woodie Pivot Points
function calculateWoodiePivots(ohlc: OHLCData): PivotLevels {
  const { high, low, open, close } = ohlc;
  const pivot = (high + low + 2 * open) / 4;
  const range = high - low;
  
  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round((2 * pivot - low) * 100) / 100,
    r2: Math.round((pivot + range) * 100) / 100,
    r3: Math.round((pivot + 2 * range) * 100) / 100,
    s1: Math.round((2 * pivot - high) * 100) / 100,
    s2: Math.round((pivot - range) * 100) / 100,
    s3: Math.round((pivot - 2 * range) * 100) / 100,
    type: 'Woodie',
  };
}

// DeMark Pivot Points
function calculateDemarkPivots(ohlc: OHLCData): PivotLevels {
  const { high, low, open, close } = ohlc;
  let x: number;
  
  if (close < open) {
    x = high + 2 * low + close;
  } else if (close > open) {
    x = 2 * high + low + close;
  } else {
    x = high + low + 2 * close;
  }
  
  const pivot = x / 4;
  
  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round((x / 2 - low) * 100) / 100,
    r2: Math.round((2 * pivot - low) * 100) / 100,
    r3: Math.round((pivot + (high - low)) * 100) / 100,
    s1: Math.round((x / 2 - high) * 100) / 100,
    s2: Math.round((2 * pivot - high) * 100) / 100,
    s3: Math.round((pivot - (high - low)) * 100) / 100,
    type: 'DeMark',
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      symbol, 
      ohlc, 
      pivotType = 'classic',
      calculationSource = 'prevDay'
    } = body;

    let ohlcData: OHLCData | null = null;

    // If OHLC data is provided directly
    if (ohlc && ohlc.open && ohlc.high && ohlc.low && ohlc.close) {
      ohlcData = ohlc;
    } else if (symbol) {
      // Fetch from database
      const stock = await db.stock.findUnique({
        where: { symbol },
        include: { stockData: true },
      });

      if (!stock) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      const data = stock.stockData;
      
      // Select OHLC based on calculation source (use demo values if no data)
      switch (calculationSource) {
        case 'prevDay':
          ohlcData = {
            open: data?.prevOpen || 0,
            high: data?.prevHigh || 0,
            low: data?.prevLow || 0,
            close: data?.prevClose || 0,
          };
          break;
        case 'prevWeek':
          ohlcData = {
            open: data?.prevWeekOpen || 0,
            high: data?.prevWeekHigh || 0,
            low: data?.prevWeekLow || 0,
            close: data?.prevWeekClose || 0,
          };
          break;
        case 'prevMonth':
          ohlcData = {
            open: data?.prevMonthClose || 0,
            high: data?.prevMonthHigh || 0,
            low: data?.prevMonthLow || 0,
            close: data?.prevMonthClose || 0,
          };
          break;
        case 'today':
          ohlcData = {
            open: data?.todayOpen || 0,
            high: data?.todayHigh || 0,
            low: data?.todayLow || 0,
            close: data?.todayClose || data?.todayOpen || 0,
          };
          break;
        default:
          ohlcData = {
            open: data?.prevOpen || 0,
            high: data?.prevHigh || 0,
            low: data?.prevLow || 0,
            close: data?.prevClose || 0,
          };
      }
    }

    if (!ohlcData) {
      return NextResponse.json({ error: 'Symbol or OHLC data required' }, { status: 400 });
    }

    // Validate OHLC data - provide demo values if missing
    if (!ohlcData.high || !ohlcData.low || !ohlcData.close) {
      // Use demo values for demonstration
      const demoClose = ohlcData.close || 2500;
      const demoHigh = ohlcData.high || demoClose * 1.02;
      const demoLow = ohlcData.low || demoClose * 0.98;
      const demoOpen = ohlcData.open || demoClose;
      
      ohlcData = {
        open: demoOpen,
        high: demoHigh,
        low: demoLow,
        close: demoClose,
      };
    }

    // Calculate pivots based on type
    let levels: PivotLevels;
    
    switch (pivotType) {
      case 'fibonacci':
        levels = calculateFibonacciPivots(ohlcData);
        break;
      case 'camarilla':
        levels = calculateCamarillaPivots(ohlcData);
        break;
      case 'woodie':
        levels = calculateWoodiePivots(ohlcData);
        break;
      case 'demark':
        levels = calculateDemarkPivots(ohlcData);
        break;
      case 'classic':
      default:
        levels = calculateClassicPivots(ohlcData);
    }

    // Calculate all types for comparison
    const allLevels = {
      classic: calculateClassicPivots(ohlcData),
      fibonacci: calculateFibonacciPivots(ohlcData),
      camarilla: calculateCamarillaPivots(ohlcData),
      woodie: calculateWoodiePivots(ohlcData),
      demark: calculateDemarkPivots(ohlcData),
    };

    return NextResponse.json({
      symbol,
      ohlc: ohlcData,
      pivotType,
      calculationSource,
      levels,
      allLevels,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating levels:', error);
    return NextResponse.json({ error: 'Failed to calculate levels' }, { status: 500 });
  }
}

// GET endpoint to get stored stock data
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

    return NextResponse.json({
      stock,
      stockData: stock.stockData,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
