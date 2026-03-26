import { NextResponse } from 'next/server';

// News API - provides stock news (using fallback for reliability)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'NIFTY';

  // Generate relevant news based on symbol
  const getNews = (stockSymbol: string) => [
    {
      id: 'fn-1',
      title: `${stockSymbol} Trading Levels Updated`,
      summary: `Real-time pivot levels calculated for ${stockSymbol} using Classic, Fibonacci, Camarilla, Woodie, and DeMark methodologies.`,
      source: 'Trading Levels',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
    {
      id: 'fn-2',
      title: 'Market Overview - NIFTY Analysis',
      summary: 'Indian stock markets showing mixed trends. FNO stocks witnessing active trading with significant volume. Bank Nifty and IT sector showing strength.',
      source: 'Market Watch',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
    {
      id: 'fn-3',
      title: 'Technical Analysis Tips for Day Traders',
      summary: 'Use pivot points to identify key support and resistance levels. R1/R2 for resistance (sell zones), S1/S2 for support (buy zones). Always use stop-loss.',
      source: 'Trading Guide',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
    {
      id: 'fn-4',
      title: 'Risk Management Reminder',
      summary: 'Always use proper stop-loss orders and position sizing. Never risk more than 2% of your capital on a single trade. Follow your trading plan.',
      source: 'Trading Guide',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
    {
      id: 'fn-5',
      title: `What's Moving ${stockSymbol} Today`,
      summary: `${stockSymbol} is showing volatility in today's session. Traders should watch the pivot levels for potential entry and exit points.`,
      source: 'Market News',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
    {
      id: 'fn-6',
      title: 'FII/DII Activity Update',
      summary: 'Foreign institutional investors continue to be active in Indian markets. Monitor their activity for market direction clues.',
      source: 'Market Data',
      url: '#',
      publishedAt: new Date().toISOString(),
      symbol: stockSymbol,
    },
  ];

  return NextResponse.json({ 
    news: getNews(symbol), 
    symbol, 
    timestamp: new Date().toISOString(),
    source: 'trading-levels'
  });
}
