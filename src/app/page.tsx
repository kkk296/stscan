'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Moon,
  Sun,
  LogOut,
  Grid3X3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RefreshCw,
  BarChart3,
  Settings,
  Target,
  Zap,
  Bell,
  Heart,
  Loader2,
} from 'lucide-react';

// Types
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  pChange: number;
  yOpen: number;
  yHigh: number;
  yLow: number;
  yClose: number;
  tOpen: number;
  tHigh: number;
  tLow: number;
  tClose: number;
  week52High: number;
  week52Low: number;
  lifetimeHigh: number;
  lifetimeLow: number;
  pmHigh: number;
  pmLow: number;
  pmClose: number;
  isBuy?: boolean;
}

interface GannLevels {
  buy: { entry: number; avg: number; sl: number; t1: number; t2: number; t3: number };
  sell: { entry: number; avg: number; sl: number; t1: number; t2: number; t3: number };
}

// NIFTY Indices (static reference)
const NIFTY_INDICES = [
  { name: 'NIFTY 50', symbol: 'NIFTY 50', refPrice: 23306.45 },
  { name: 'BANK NIFTY', symbol: 'BANK NIFTY', refPrice: 50123.30 },
  { name: 'NIFTY IT', symbol: 'NIFTY IT', refPrice: 35420.80 },
  { name: 'RELIANCE', symbol: 'RELIANCE', refPrice: 1450.00 },
  { name: 'TCS', symbol: 'TCS', refPrice: 4100.00 },
  { name: 'HDFCBANK', symbol: 'HDFCBANK', refPrice: 1650.00 },
];

// Gann calculation steps
// For BUY: Entry above base, SL below entry (but above base), Targets above entry
// For SELL: Entry below base, SL above entry (but below base), Targets below entry
const GANN_STEPS = {
  buy: { up: 0.333, avg: 0.250, sl: 0.166, t1: 0.416, t2: 0.500, t3: 0.666 },
  sell: { below: -0.333, avg: -0.250, sl: -0.166, t1: -0.416, t2: -0.500, t3: -0.666 }
};

// Calculate Gann levels
const calculateGann = (price: number, multiplier: number): GannLevels => {
  const baseSqrt = Math.sqrt(price);
  const step = (val: number) => Math.pow(baseSqrt + (val * multiplier), 2);

  // Calculate all levels
  const buyEntry = step(GANN_STEPS.buy.up);     // Above base
  const buyAvg = step(GANN_STEPS.buy.avg);       // Above base, below entry
  const buySL = step(GANN_STEPS.buy.sl);         // Above base, below avg (stoploss)
  const buyT1 = step(GANN_STEPS.buy.t1);         // Above entry
  const buyT2 = step(GANN_STEPS.buy.t2);         // Above T1
  const buyT3 = step(GANN_STEPS.buy.t3);         // Above T2

  const sellEntry = step(GANN_STEPS.sell.below); // Below base
  const sellAvg = step(GANN_STEPS.sell.avg);     // Below base, above entry
  const sellSL = step(GANN_STEPS.sell.sl);       // Below base, above avg (stoploss)
  const sellT1 = step(GANN_STEPS.sell.t1);       // Below entry
  const sellT2 = step(GANN_STEPS.sell.t2);       // Below T1
  const sellT3 = step(GANN_STEPS.sell.t3);       // Below T2

  return {
    buy: {
      entry: buyEntry,
      avg: buyAvg,
      sl: buySL,
      t1: buyT1,
      t2: buyT2,
      t3: buyT3
    },
    sell: {
      entry: sellEntry,
      avg: sellAvg,
      sl: sellSL,
      t1: sellT1,
      t2: sellT2,
      t3: sellT3
    }
  };
};

// Data grid component
const DataCell = ({ label, value, color }: { label: string; value: number; color: 'purple' | 'green' | 'red' | 'cyan' | 'orange' }) => {
  const colorClasses = {
    purple: 'text-purple-400 border-l-purple-500',
    green: 'text-emerald-400 border-l-emerald-500',
    red: 'text-rose-400 border-l-rose-500',
    cyan: 'text-cyan-400 border-l-cyan-500',
    orange: 'text-orange-400 border-l-orange-500',
  };

  return (
    <div className={`bg-[#0f1629] border border-[#1e293b] border-l-2 rounded-lg p-3 text-center`}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${colorClasses[color]}`}>₹{value?.toFixed(2) || '0.00'}</p>
    </div>
  );
};

export default function StockMagicDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'favorites'>('all');
  
  // Calculator state
  const [baseSource, setBaseSource] = useState('prevClose');
  const [calcPrice, setCalcPrice] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [multiplier, setMultiplier] = useState('1');
  const [gannLevels, setGannLevels] = useState<GannLevels | null>(null);

  // Client-side only render helper
  const [isClient, setIsClient] = useState(false);
  const [themeColor, setThemeColor] = useState<'purple' | 'blue' | 'cyan' | 'orange'>('purple');
  
  // Theme color mappings
  const themeColors = {
    purple: {
      primary: '#a855f7',
      bg: '#0a0f1c',
      card: '#0f1629',
      accent: 'rgba(168, 85, 247, 0.2)',
      border: 'rgba(168, 85, 247, 0.5)',
    },
    blue: {
      primary: '#3b82f6',
      bg: '#0a0f1c',
      card: '#0f1629',
      accent: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(59, 130, 246, 0.5)',
    },
    cyan: {
      primary: '#06b6d4',
      bg: '#0a0f1c',
      card: '#0f1629',
      accent: 'rgba(6, 182, 212, 0.2)',
      border: 'rgba(6, 182, 212, 0.5)',
    },
    orange: {
      primary: '#f97316',
      bg: '#0a0f1c',
      card: '#0f1629',
      accent: 'rgba(249, 115, 22, 0.2)',
      border: 'rgba(249, 115, 22, 0.5)',
    },
  };
  
  useEffect(() => {
    setIsClient(true);
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('stockFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    // Load theme color
    const savedTheme = localStorage.getItem('themeColor') as 'purple' | 'blue' | 'cyan' | 'orange' | null;
    if (savedTheme) {
      setThemeColor(savedTheme);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (isClient && favorites.length > 0) {
      localStorage.setItem('stockFavorites', JSON.stringify(favorites));
    }
  }, [favorites, isClient]);

  // Save theme color to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('themeColor', themeColor);
    }
  }, [themeColor, isClient]);

  // Handle theme color change
  const handleThemeChange = (color: 'purple' | 'blue' | 'cyan' | 'orange') => {
    setThemeColor(color);
    toast.success(`Theme changed to ${color}`);
  };

  // Fetch all stocks from API
  const fetchAllStocks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/yahoo?all=true');
      const result = await response.json();
      
      if (result.success && result.data) {
        setStocks(result.data);
        
        // Select first stock if none selected
        if (!selectedStock && result.data.length > 0) {
          const firstStock = result.data[0];
          setSelectedStock(firstStock);
          setCalcPrice(firstStock.yClose?.toFixed(2) || firstStock.price?.toFixed(2));
          setGannLevels(calculateGann(firstStock.yClose || firstStock.price, 1));
        }
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch stock data');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [selectedStock]);

  // Fetch single stock
  const fetchStock = async (symbol: string) => {
    try {
      const response = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data as Stock;
      }
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }
    return null;
  };

  // Initial load
  useEffect(() => {
    if (isClient) {
      fetchAllStocks();
    }
  }, [isClient, fetchAllStocks]);

  // Toggle favorite
  const toggleFavorite = (symbol: string) => {
    if (favorites.includes(symbol)) {
      setFavorites(favorites.filter(f => f !== symbol));
      toast.success(`${symbol} removed from favorites`);
    } else {
      setFavorites([...favorites, symbol]);
      toast.success(`${symbol} added to favorites`);
    }
  };

  // Handle index click
  const handleIndexClick = async (index: typeof NIFTY_INDICES[0]) => {
    setIsLoading(true);
    const stockData = await fetchStock(index.symbol);
    if (stockData) {
      setSelectedStock(stockData);
      updateCalculator(stockData, baseSource);
      toast.success(`Viewing ${index.name}`);
    } else {
      toast.error(`Failed to load ${index.name}`);
    }
    setIsLoading(false);
  };

  // Handle watchlist click
  const handleWatchlistClick = async (stock: Stock) => {
    setIsLoading(true);
    const stockData = await fetchStock(stock.symbol);
    if (stockData) {
      setSelectedStock(stockData);
      updateCalculator(stockData, baseSource);
    }
    setIsLoading(false);
  };

  // Update calculator based on source
  const updateCalculator = (stock: Stock, source: string) => {
    let price = stock.yClose;
    if (source === 'prevHigh') price = stock.yHigh;
    else if (source === 'prevLow') price = stock.yLow;
    else if (source === 'tOpen') price = stock.tOpen;
    else if (source === 'tHigh') price = stock.tHigh;
    else if (source === 'tLow') price = stock.tLow;
    else if (source === 'pmHigh') price = stock.pmHigh;
    else if (source === 'pmLow') price = stock.pmLow;
    else if (source === 'live') price = stock.price;
    else if (source === 'custom') {
      const customPrice = parseFloat(calcPrice);
      if (customPrice && !isNaN(customPrice)) {
        setGannLevels(calculateGann(customPrice, parseFloat(multiplier)));
      }
      return;
    }
    
    setCalcPrice(price?.toFixed(2) || '0');
    setGannLevels(calculateGann(price || 0, parseFloat(multiplier)));
  };

  // Handle base source change
  const handleBaseSourceChange = (value: string) => {
    setBaseSource(value);
    if (selectedStock) {
      updateCalculator(selectedStock, value);
    }
  };

  // Handle multiplier change
  const handleMultiplierChange = (value: string) => {
    setMultiplier(value);
    const price = parseFloat(calcPrice);
    if (price) {
      setGannLevels(calculateGann(price, parseFloat(value)));
    }
  };

  // Manual calculate
  const handleManualCalculate = () => {
    const price = parseFloat(calcPrice);
    if (price && !isNaN(price)) {
      setGannLevels(calculateGann(price, parseFloat(multiplier)));
      toast.success('Levels calculated');
    }
  };

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    await fetchAllStocks();
    toast.success('Data refreshed');
  };

  // Multiplier list
  const multipliers = ['1', '1.25', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '32', '35', '40', '45', '50'];

  // Filter stocks - Sort by pChange for Top Gainers/Losers
  const getFilteredStocks = () => {
    let filteredStocks = [...stocks]; // Create a copy to avoid mutating original
    
    // Apply search filter
    if (searchQuery) {
      filteredStocks = filteredStocks.filter(s => 
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter and sort
    if (filterType === 'buy') {
      // Buy signal: Positive percentage change (TOP GAINERS)
      filteredStocks = filteredStocks
        .filter(s => s.pChange > 0)
        .sort((a, b) => b.pChange - a.pChange); // Sort descending (highest gain first)
    } else if (filterType === 'sell') {
      // Sell signal: Negative percentage change (TOP LOSERS)
      filteredStocks = filteredStocks
        .filter(s => s.pChange < 0)
        .sort((a, b) => a.pChange - b.pChange); // Sort ascending (highest loss first)
    } else if (filterType === 'favorites') {
      filteredStocks = filteredStocks.filter(s => favorites.includes(s.symbol));
    }
    
    return filteredStocks;
  };

  if (!isClient || isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: themeColors[themeColor].primary }} />
          <p className="text-white text-lg">Loading Real Stock Data...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching from Yahoo Finance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
      <Toaster position="bottom-right" theme="dark" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1c]/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: themeColors[themeColor].primary }} />
              <h1 className="text-lg font-bold" style={{ color: themeColors[themeColor].primary }}>STOCK MAGIC DASHBOARD</h1>
            </div>
            <Badge className="text-xs border" style={{ backgroundColor: themeColors[themeColor].accent, color: themeColors[themeColor].primary, borderColor: themeColors[themeColor].border }}>LIVE DATA</Badge>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50">
              {isDarkMode ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleThemeChange('purple')} 
                className={`w-5 h-5 rounded-full bg-purple-500 transition-all hover:scale-125 ${themeColor === 'purple' ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                title="Purple Theme"
              />
              <button 
                onClick={() => handleThemeChange('blue')} 
                className={`w-5 h-5 rounded-full bg-blue-500 transition-all hover:scale-125 ${themeColor === 'blue' ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                title="Blue Theme"
              />
              <button 
                onClick={() => handleThemeChange('cyan')} 
                className={`w-5 h-5 rounded-full bg-cyan-500 transition-all hover:scale-125 ${themeColor === 'cyan' ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                title="Cyan Theme"
              />
              <button 
                onClick={() => handleThemeChange('orange')} 
                className={`w-5 h-5 rounded-full bg-orange-500 transition-all hover:scale-125 ${themeColor === 'orange' ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                title="Orange Theme"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5" />
              {isClient ? new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' | ' + new Date().toLocaleDateString('en-IN') : '--:--:-- | --/--/----'}
            </div>
            <button className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50">
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
            <button className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30">
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-[#0a0f1c] border-r border-slate-800 flex flex-col">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-[#0f1629] border-slate-700 text-white placeholder:text-slate-500 h-9" />
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4" style={{ color: themeColors[themeColor].primary }} />
              <span className="text-xs font-semibold" style={{ color: themeColors[themeColor].primary }}>QUICK ACCESS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NIFTY_INDICES.map((idx) => {
                // Find stock from loaded stocks array
                const stockData = stocks.find(s => s.symbol === idx.symbol);
                return (
                  <div 
                    key={idx.name} 
                    onClick={() => handleIndexClick(idx)} 
                    className={`p-2.5 rounded-lg cursor-pointer transition-all ${selectedStock?.symbol === idx.symbol ? 'border' : 'bg-[#0f1629] border border-[#1e293b] hover:border-purple-500/30'}`}
                    style={selectedStock?.symbol === idx.symbol ? { backgroundColor: themeColors[themeColor].accent, borderColor: themeColors[themeColor].border } : {}}
                  >
                    <p className="text-[10px] text-slate-400">{idx.name}</p>
                    {stockData ? (
                      <>
                        <p className="text-xs font-bold text-white">₹{stockData.price?.toFixed(2)}</p>
                        <p className={`text-[10px] font-semibold ${stockData.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stockData.pChange >= 0 ? '+' : ''}{stockData.pChange?.toFixed(2)}%
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-slate-500">Loading...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Tabs - All, Buy, Sell, Fav */}
          <div className="flex gap-1 px-3 py-3">
            <Button 
              size="sm" 
              onClick={() => setFilterType('all')}
              className={`flex-1 font-semibold h-8 text-[10px] px-2 ${filterType === 'all' ? 'text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              style={filterType === 'all' ? { backgroundColor: themeColors[themeColor].primary } : {}}
            >
              All
            </Button>
            <Button 
              size="sm" 
              onClick={() => setFilterType('buy')}
              className={`flex-1 font-semibold h-8 text-[10px] px-2 ${filterType === 'buy' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <TrendingUp className="w-3 h-3 mr-0.5" /> Buy
            </Button>
            <Button 
              size="sm" 
              onClick={() => setFilterType('sell')}
              className={`flex-1 font-semibold h-8 text-[10px] px-2 ${filterType === 'sell' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <TrendingDown className="w-3 h-3 mr-0.5" /> Sell
            </Button>
            <Button 
              size="sm" 
              onClick={() => setFilterType('favorites')}
              className={`font-semibold h-8 px-2 ${filterType === 'favorites' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'}`}
            >
              <Star className="w-3 h-3" />
            </Button>
          </div>

          {/* Watchlist - No scrolling animation */}
          <div className="flex-1 px-3 py-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">
                {filterType === 'favorites' ? 'FAVORITES' : filterType === 'buy' ? 'BUY SIGNALS' : filterType === 'sell' ? 'SELL SIGNALS' : 'WATCHLIST'} ({getFilteredStocks().length})
              </span>
              <RefreshCw onClick={refreshData} className={`w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div className="space-y-1">
              {getFilteredStocks().map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleWatchlistClick(stock)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedStock?.symbol === stock.symbol ? 'border' : 'hover:bg-slate-800/50'
                  } ${stock.pChange > 0 ? 'border-l-2 border-l-emerald-500' : 'border-l-2 border-l-rose-500'}`}
                  style={selectedStock?.symbol === stock.symbol ? { backgroundColor: themeColors[themeColor].accent, borderColor: themeColors[themeColor].border } : {}}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(stock.symbol);
                      }}
                      className={`${favorites.includes(stock.symbol) ? 'text-amber-400' : 'text-slate-600'} hover:text-amber-400 transition-colors`}
                    >
                      <Star className={`w-3.5 h-3.5 ${favorites.includes(stock.symbol) ? 'fill-amber-400' : ''}`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-white">{stock.symbol}</p>
                      <p className="text-[10px] text-slate-500">₹{stock.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${stock.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stock.pChange >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs font-semibold">{stock.pChange >= 0 ? '+' : ''}{stock.pChange?.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
              {getFilteredStocks().length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">{filterType === 'favorites' ? 'No favorites yet' : 'No stocks found'}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 overflow-y-auto">
          {selectedStock ? (
            <div className="space-y-5">
              {/* Stock Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-white">{selectedStock.symbol}</h2>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">{selectedStock.name}</Badge>
                  <button
                    onClick={() => toggleFavorite(selectedStock.symbol)}
                    className={`${favorites.includes(selectedStock.symbol) ? 'text-amber-400' : 'text-slate-500'} hover:text-amber-400`}
                  >
                    <Star className={`w-5 h-5 ${favorites.includes(selectedStock.symbol) ? 'fill-amber-400' : ''}`} />
                  </button>
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColors[themeColor].primary }} />}
                </div>
                {isClient && (
                  <div className="text-right" suppressHydrationWarning>
                    <p className="text-2xl font-bold text-white">₹{selectedStock.price?.toFixed(2)}</p>
                    <p className={`text-sm font-semibold ${selectedStock.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedStock.pChange >= 0 ? '+' : ''}{selectedStock.change?.toFixed(2)} ({selectedStock.pChange >= 0 ? '+' : ''}{selectedStock.pChange?.toFixed(2)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Data Grid - 4x4 with real OHLC */}
              <Card className="bg-[#0f1629] border border-[#1e293b]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {/* Yesterday OHLC */}
                    <DataCell label="Y.OPEN" value={selectedStock.yOpen} color="purple" />
                    <DataCell label="Y.HIGH" value={selectedStock.yHigh} color="green" />
                    <DataCell label="Y.LOW" value={selectedStock.yLow} color="red" />
                    <DataCell label="Y.CLOSE" value={selectedStock.yClose} color="cyan" />
                    
                    {/* Today OHLC */}
                    <DataCell label="T.OPEN" value={selectedStock.tOpen} color="cyan" />
                    <DataCell label="T.HIGH" value={selectedStock.tHigh} color="green" />
                    <DataCell label="T.LOW" value={selectedStock.tLow} color="red" />
                    <DataCell label="T.CLOSE" value={selectedStock.tClose} color="purple" />
                    
                    {/* Previous Month */}
                    <DataCell label="PM.HIGH" value={selectedStock.pmHigh} color="orange" />
                    <DataCell label="PM.LOW" value={selectedStock.pmLow} color="orange" />
                    <DataCell label="PM.CLOSE" value={selectedStock.pmClose} color="cyan" />
                    <div></div>
                    
                    {/* 52 Week & Lifetime */}
                    <DataCell label="52W HIGH" value={selectedStock.week52High} color="green" />
                    <DataCell label="52W LOW" value={selectedStock.week52Low} color="red" />
                    <DataCell label="LIFETIME HIGH" value={selectedStock.lifetimeHigh} color="cyan" />
                    <DataCell label="LIFETIME LOW" value={selectedStock.lifetimeLow} color="purple" />
                  </div>
                </CardContent>
              </Card>

              {/* Gann Calculator */}
              <Card className="bg-[#0f1629] border border-[#1e293b]">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5" style={{ color: themeColors[themeColor].primary }} />
                    <h3 className="text-base font-bold">MAGIC LEVELS CALCULATOR</h3>
                  </div>
                  
                  {/* Base Price Source Tabs */}
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-2 block">BASE PRICE SOURCE</label>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { value: 'prevClose', label: 'Y.Close' },
                        { value: 'prevHigh', label: 'Y.High' },
                        { value: 'prevLow', label: 'Y.Low' },
                        { value: 'tOpen', label: 'T.Open' },
                        { value: 'tHigh', label: 'T.High' },
                        { value: 'tLow', label: 'T.Low' },
                        { value: 'pmHigh', label: 'PM.High' },
                        { value: 'pmLow', label: 'PM.Low' },
                        { value: 'live', label: 'Live' },
                        { value: 'custom', label: 'Custom' },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => handleBaseSourceChange(tab.value)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                            baseSource === tab.value
                              ? 'text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          style={baseSource === tab.value ? { backgroundColor: themeColors[themeColor].primary } : {}}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Calculation Price & Multiplier Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">CALCULATION PRICE</label>
                      <Input
                        type="number"
                        step="0.05"
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(e.target.value)}
                        className="bg-black border-[#333] text-white h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">VOLATILITY (MULTIPLIER)</label>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {multipliers.map((m) => (
                          <button
                            key={m}
                            onClick={() => handleMultiplierChange(m)}
                            className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                              multiplier === m
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {m}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Alert Price */}
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <Bell className="w-3 h-3" /> BREAKOUT ALERT PRICE
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      placeholder="Enter price for alert..."
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      className="bg-black border-[#333] text-white h-10"
                    />
                  </div>
                  
                  {/* Calculate Button */}
                  <Button onClick={handleManualCalculate} className="w-full text-white font-bold mb-5 hover:opacity-90" style={{ backgroundColor: themeColors[themeColor].primary }}>
                    <Zap className="w-4 h-4 mr-2" /> CALCULATE LEVELS
                  </Button>
                  
                  {/* Levels Display - 3 Columns */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Buy Levels */}
                    <div className="bg-slate-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/30">
                        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> BUY
                        </h3>
                      </div>
                      {gannLevels ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Entry</span><span className="text-emerald-400 font-bold">₹{gannLevels.buy.entry.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Avg</span><span className="text-emerald-400 font-bold">₹{gannLevels.buy.avg.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">SL</span><span className="text-rose-400 font-bold">₹{gannLevels.buy.sl.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T1</span><span className="text-cyan-400 font-bold">₹{gannLevels.buy.t1.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T2</span><span className="text-cyan-400 font-bold">₹{gannLevels.buy.t2.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T3</span><span className="text-cyan-400 font-bold">₹{gannLevels.buy.t3.toFixed(2)}</span></div>
                        </div>
                      ) : <div className="text-slate-500 text-sm text-center py-4">Calculate to see levels</div>}
                    </div>
                    
                    {/* Sell Levels */}
                    <div className="bg-slate-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/30">
                        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" /> SELL
                        </h3>
                      </div>
                      {gannLevels ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Entry</span><span className="text-rose-400 font-bold">₹{gannLevels.sell.entry.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Avg</span><span className="text-rose-400 font-bold">₹{gannLevels.sell.avg.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">SL</span><span className="text-rose-400 font-bold">₹{gannLevels.sell.sl.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T1</span><span className="text-cyan-400 font-bold">₹{gannLevels.sell.t1.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T2</span><span className="text-cyan-400 font-bold">₹{gannLevels.sell.t2.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">T3</span><span className="text-cyan-400 font-bold">₹{gannLevels.sell.t3.toFixed(2)}</span></div>
                        </div>
                      ) : <div className="text-slate-500 text-sm text-center py-4">Calculate to see levels</div>}
                    </div>
                    
                    {/* News Section */}
                    <div className="bg-slate-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
                        <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                          NEWS
                        </h3>
                      </div>
                      <div className="space-y-2 text-xs">
                        <a href={`https://www.google.com/search?q=${selectedStock.symbol}+stock+news`} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-900/50 rounded hover:bg-slate-900 cursor-pointer">
                          <p className="text-white font-medium line-clamp-2">{selectedStock.symbol} Stock Latest News</p>
                          <p className="text-slate-500 mt-1">Google News</p>
                        </a>
                        <a href={`https://www.moneycontrol.com/stocks/cptmarket/stocksearch.php?search_data=${selectedStock.symbol}`} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-900/50 rounded hover:bg-slate-900 cursor-pointer">
                          <p className="text-white font-medium line-clamp-2">{selectedStock.symbol} Live Market Updates</p>
                          <p className="text-slate-500 mt-1">Moneycontrol</p>
                        </a>
                        <a href={`https://in.tradingview.com/chart/?symbol=NSE%3A${selectedStock.symbol}`} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-900/50 rounded hover:bg-slate-900 cursor-pointer">
                          <p className="text-white font-medium line-clamp-2">{selectedStock.symbol} Technical Analysis</p>
                          <p className="text-slate-500 mt-1">TradingView</p>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Change Indicator */}
              {isClient && (
                <div className="flex items-center gap-4" suppressHydrationWarning>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedStock.pChange >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                    {selectedStock.pChange >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
                    <span className={`text-lg font-bold ${selectedStock.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedStock.pChange >= 0 ? '+' : ''}{selectedStock.change?.toFixed(2)} ({selectedStock.pChange?.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Real-time data from Yahoo Finance</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-medium text-slate-300">Select a Stock</h3>
                <p className="text-sm text-slate-500 mt-2">Choose from indices or watchlist</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
