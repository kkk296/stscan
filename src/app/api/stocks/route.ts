import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// FNO Stocks list - major Indian stocks
const FNO_STOCKS = [
  // Nifty 50 Stocks
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', industry: 'Oil & Gas', lotSize: 250 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', industry: 'IT Services', lotSize: 150 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 150 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', industry: 'IT Services', lotSize: 300 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 250 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 150 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial', industry: 'Banking', lotSize: 375 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', industry: 'Telecom Services', lotSize: 250 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 200 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 150 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Industrial', industry: 'Engineering', lotSize: 150 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 300 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer', industry: 'Paints', lotSize: 150 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 100 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 200 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer', industry: 'Jewellery', lotSize: 150 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Financial', industry: 'NBFC', lotSize: 125 },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd', sector: 'Retail', industry: 'Retail', lotSize: 150 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', industry: 'IT Services', lotSize: 300 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', industry: 'IT Services', lotSize: 500 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Materials', industry: 'Cement', lotSize: 150 },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Energy', industry: 'Power', lotSize: 300 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Energy', industry: 'Power', lotSize: 2000 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 300 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Materials', industry: 'Steel', lotSize: 500 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Materials', industry: 'Steel', lotSize: 300 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 200 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Conglomerate', industry: 'Diversified', lotSize: 250 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', sector: 'Infrastructure', industry: 'Ports', lotSize: 250 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 125 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp Ltd', sector: 'Energy', industry: 'Oil & Gas', lotSize: 450 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG', industry: 'Food', lotSize: 100 },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 250 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Energy', industry: 'Mining', lotSize: 900 },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 100 },
  { symbol: 'DRREDDY', name: 'Dr Reddys Laboratories Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 125 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 50 },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Materials', industry: 'Cement/Fibers', lotSize: 300 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Ltd', sector: 'Financial', industry: 'Insurance', lotSize: 250 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Auto', industry: 'Automobile', lotSize: 200 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Materials', industry: 'Aluminum', lotSize: 350 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 250 },
  { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd', sector: 'Materials', industry: 'Steel', lotSize: 400 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp Ltd', sector: 'Energy', industry: 'Oil & Gas', lotSize: 1375 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Ltd', sector: 'Financial', industry: 'Insurance', lotSize: 250 },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Materials', industry: 'Cement', lotSize: 50 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', industry: 'IT Services', lotSize: 400 },
  { symbol: 'UPL', name: 'UPL Ltd', sector: 'Chemicals', industry: 'Agrochemicals', lotSize: 450 },
  { symbol: 'ZEEL', name: 'Zee Entertainment Ltd', sector: 'Media', industry: 'Media', lotSize: 500 },
  
  // Additional FNO Stocks
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Financial', industry: 'Banking', lotSize: 750 },
  { symbol: 'GAIL', name: 'GAIL India Ltd', sector: 'Energy', industry: 'Gas', lotSize: 700 },
  { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom', industry: 'Telecom Services', lotSize: 2800 },
  { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Financial', industry: 'Banking', lotSize: 1400 },
  { symbol: 'RBLBANK', name: 'RBL Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 500 },
  { symbol: 'YESBANK', name: 'Yes Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 1100 },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Internet', industry: 'Food Delivery', lotSize: 350 },
  { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', sector: 'Internet', industry: 'E-Commerce', lotSize: 150 },
  { symbol: 'PAYTM', name: 'One97 Communications (Paytm)', sector: 'Internet', industry: 'Fintech', lotSize: 250 },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd', sector: 'Industrial', industry: 'Cables', lotSize: 125 },
  { symbol: 'PIIND', name: 'PI Industries Ltd', sector: 'Chemicals', industry: 'Agrochemicals', lotSize: 125 },
  { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 300 },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 225 },
  { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 300 },
  { symbol: 'COLPAL', name: 'Colgate Palmolive India', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 250 },
  { symbol: 'PEL', name: 'Piramal Enterprises Ltd', sector: 'Financial', industry: 'NBFC', lotSize: 200 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Ltd', sector: 'Healthcare', industry: 'Hospitals', lotSize: 125 },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Ltd', sector: 'Healthcare', industry: 'Hospitals', lotSize: 400 },
  { symbol: 'LAURUSLABS', name: 'Laurus Labs Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 300 },
  { symbol: 'BIOCON', name: 'Biocon Ltd', sector: 'Healthcare', industry: 'Biotech', lotSize: 450 },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals', sector: 'Healthcare', industry: 'Pharma', lotSize: 150 },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 300 },
  { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 250 },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals', sector: 'Industrial', industry: 'Engineering', lotSize: 2300 },
  { symbol: 'CONCOR', name: 'Container Corporation', sector: 'Logistics', industry: 'Logistics', lotSize: 350 },
  { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics', industry: 'Logistics', lotSize: 225 },
  { symbol: 'IRCTC', name: 'IRCTC Ltd', sector: 'Services', industry: 'Railway Services', lotSize: 175 },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation', sector: 'Services', industry: 'Aviation', lotSize: 150 },
  { symbol: 'SPICEJET', name: 'SpiceJet Ltd', sector: 'Services', industry: 'Aviation', lotSize: 1500 },
  { symbol: 'PVR', name: 'PVR Ltd', sector: 'Media', industry: 'Entertainment', lotSize: 250 },
  { symbol: 'GLENMARK', name: 'Glenmark Pharmaceuticals', sector: 'Healthcare', industry: 'Pharma', lotSize: 300 },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', sector: 'Financial', industry: 'NBFC', lotSize: 200 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Financial', industry: 'Financial Services', lotSize: 50 },
  { symbol: 'SRF', name: 'SRF Ltd', sector: 'Chemicals', industry: 'Chemicals', lotSize: 50 },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd', sector: 'Chemicals', industry: 'Chemicals', lotSize: 75 },
  { symbol: 'ATUL', name: 'Atul Ltd', sector: 'Chemicals', industry: 'Chemicals', lotSize: 75 },
  { symbol: 'NAUKRI', name: 'Info Edge India Ltd', sector: 'Internet', industry: 'Online Classifieds', lotSize: 75 },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 500 },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 600 },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Financial', industry: 'Banking', lotSize: 350 },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank', sector: 'Financial', industry: 'Banking', lotSize: 200 },
  { symbol: 'HINDPETRO', name: 'Hindustan Petroleum Corp', sector: 'Energy', industry: 'Oil & Gas', lotSize: 550 },
  { symbol: 'MGL', name: 'Mahanagar Gas Ltd', sector: 'Energy', industry: 'Gas', lotSize: 250 },
  { symbol: 'PETRONET', name: 'Petronet LNG Ltd', sector: 'Energy', industry: 'Oil & Gas', lotSize: 300 },
  { symbol: 'GICRE', name: 'GIC Re', sector: 'Financial', industry: 'Reinsurance', lotSize: 2000 },
  { symbol: 'HINDZINC', name: 'Hindustan Zinc Ltd', sector: 'Materials', industry: 'Mining', lotSize: 200 },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Materials', industry: 'Cement', lotSize: 350 },
  { symbol: 'ACC', name: 'ACC Ltd', sector: 'Materials', industry: 'Cement', lotSize: 250 },
  { symbol: 'RAMCOCEM', name: 'Ramco Cements Ltd', sector: 'Materials', industry: 'Cement', lotSize: 300 },
  { symbol: 'HEXAWARE', name: 'Hexaware Technologies Ltd', sector: 'IT', industry: 'IT Services', lotSize: 200 },
  { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT', industry: 'IT Services', lotSize: 100 },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT', industry: 'IT Services', lotSize: 200 },
  { symbol: 'L&TFH', name: 'L&T Finance Holdings', sector: 'Financial', industry: 'NBFC', lotSize: 600 },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment', sector: 'Financial', industry: 'NBFC', lotSize: 250 },
  { symbol: 'MANAPPURAM', name: 'Manappuram Finance', sector: 'Financial', industry: 'NBFC', lotSize: 400 },
  { symbol: 'MOTHERSON', name: 'Motherson Sumi Wiring', sector: 'Auto', industry: 'Auto Components', lotSize: 750 },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd', sector: 'Auto', industry: 'Auto Components', lotSize: 50 },
  { symbol: 'EXIDEIND', name: 'Exide Industries Ltd', sector: 'Auto', industry: 'Auto Components', lotSize: 350 },
  { symbol: 'AMARAJABAT', name: 'Amara Raja Batteries', sector: 'Auto', industry: 'Auto Components', lotSize: 200 },
  { symbol: 'MRF', name: 'MRF Ltd', sector: 'Auto', industry: 'Tyres', lotSize: 10 },
  { symbol: 'APOLLOTYRE', name: 'Apollo Tyres Ltd', sector: 'Auto', industry: 'Tyres', lotSize: 400 },
  { symbol: 'CEATLTD', name: 'CEAT Ltd', sector: 'Auto', industry: 'Tyres', lotSize: 300 },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd', sector: 'Services', industry: 'Food Services', lotSize: 150 },
  { symbol: 'BLUEDART', name: 'Blue Dart Express Ltd', sector: 'Logistics', industry: 'Courier', lotSize: 75 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 225 },
  { symbol: 'EMAMILTD', name: 'Emami Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 200 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', industry: 'Consumer Goods', lotSize: 50 },
  { symbol: 'VBL', name: 'Varun Beverages Ltd', sector: 'FMCG', industry: 'Beverages', lotSize: 100 },
  
  // More Banking & Financial Stocks
  { symbol: 'CANBK', name: 'Canara Bank', sector: 'Financial', industry: 'Banking', lotSize: 800 },
  { symbol: 'UNIONBANK', name: 'Union Bank of India', sector: 'Financial', industry: 'Banking', lotSize: 1500 },
  { symbol: 'INDIANB', name: 'Indian Bank', sector: 'Financial', industry: 'Banking', lotSize: 900 },
  { symbol: 'BANKINDIA', name: 'Bank of India', sector: 'Financial', industry: 'Banking', lotSize: 900 },
  { symbol: 'SYNDIBANK', name: 'Syndicate Bank', sector: 'Financial', industry: 'Banking', lotSize: 1200 },
  { symbol: 'IOB', name: 'Indian Overseas Bank', sector: 'Financial', industry: 'Banking', lotSize: 2000 },
  { symbol: 'UCOBANK', name: 'UCO Bank', sector: 'Financial', industry: 'Banking', lotSize: 2500 },
  { symbol: 'CENTRALBK', name: 'Central Bank of India', sector: 'Financial', industry: 'Banking', lotSize: 3000 },
  { symbol: 'MAHABANK', name: 'Bank of Maharashtra', sector: 'Financial', industry: 'Banking', lotSize: 2500 },
  { symbol: 'PNBHOUSING', name: 'PNB Housing Finance', sector: 'Financial', industry: 'Housing Finance', lotSize: 300 },
  { symbol: 'RECLTD', name: 'REC Ltd', sector: 'Financial', industry: 'Financial Services', lotSize: 600 },
  { symbol: 'PFC', name: 'Power Finance Corp', sector: 'Financial', industry: 'Financial Services', lotSize: 600 },
  { symbol: 'IRFC', name: 'Indian Railway Finance', sector: 'Financial', industry: 'Financial Services', lotSize: 3000 },
  { symbol: 'HUDCO', name: 'Housing & Urban Dev Corp', sector: 'Financial', industry: 'Financial Services', lotSize: 1000 },
  { symbol: 'ICICIGI', name: 'ICICI Lombard General', sector: 'Financial', industry: 'Insurance', lotSize: 175 },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life', sector: 'Financial', industry: 'Insurance', lotSize: 350 },
  { symbol: 'MAXFINANCIAL', name: 'Max Financial Services', sector: 'Financial', industry: 'Insurance', lotSize: 100 },
  
  // More IT & Tech Stocks
  { symbol: 'PERSISTENT', name: 'Persistent Systems', sector: 'IT', industry: 'IT Services', lotSize: 75 },
  { symbol: 'LTIM', name: 'LTIM Mindtree Ltd', sector: 'IT', industry: 'IT Services', lotSize: 100 },
  { symbol: 'LTI', name: 'L&T Infotech Ltd', sector: 'IT', industry: 'IT Services', lotSize: 150 },
  { symbol: 'CYIENT', name: 'Cyient Ltd', sector: 'IT', industry: 'IT Services', lotSize: 200 },
  { symbol: 'SONATSOFTW', name: 'Sonata Software', sector: 'IT', industry: 'IT Services', lotSize: 100 },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd', sector: 'IT', industry: 'IT Services', lotSize: 25 },
  { symbol: 'BSOFT', name: 'Birlasoft Ltd', sector: 'IT', industry: 'IT Services', lotSize: 300 },
  { symbol: 'KPITTECH', name: 'KPIT Technologies', sector: 'IT', industry: 'IT Services', lotSize: 100 },
  { symbol: 'NEWGEN', name: 'Newgen Software', sector: 'IT', industry: 'IT Services', lotSize: 200 },
  { symbol: 'INTELLECT', name: 'Intellect Design Arena', sector: 'IT', industry: 'IT Services', lotSize: 250 },
  
  // More Pharma & Healthcare
  { symbol: 'SYNGENE', name: 'Syngene International', sector: 'Healthcare', industry: 'Biotech', lotSize: 200 },
  { symbol: 'STRIDEARO', name: 'Strides Pharma Science', sector: 'Healthcare', industry: 'Pharma', lotSize: 150 },
  { symbol: 'JUBLIANTGEN', name: 'Jubilant Generics', sector: 'Healthcare', industry: 'Pharma', lotSize: 150 },
  { symbol: 'CADILAHC', name: 'Cadila Healthcare', sector: 'Healthcare', industry: 'Pharma', lotSize: 300 },
  { symbol: 'SUNTECK', name: 'Sunteck Realty Ltd', sector: 'Real Estate', industry: 'Real Estate', lotSize: 300 },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute', sector: 'Healthcare', industry: 'Hospitals', lotSize: 150 },
  { symbol: 'METROPOLIS', name: 'Metropolis Healthcare', sector: 'Healthcare', industry: 'Diagnostics', lotSize: 100 },
  { symbol: 'DRLANDS', name: 'Dr Lal PathLabs', sector: 'Healthcare', industry: 'Diagnostics', lotSize: 75 },
  { symbol: 'THYROCARE', name: 'Thyrocare Technologies', sector: 'Healthcare', industry: 'Diagnostics', lotSize: 200 },
  
  // More Auto Stocks
  { symbol: 'TATAMTRDVR', name: 'Tata Motors DVR', sector: 'Auto', industry: 'Automobile', lotSize: 600 },
  { symbol: 'ESCORTS', name: 'Escorts Kubota Ltd', sector: 'Auto', industry: 'Tractors', lotSize: 100 },
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland Ltd', sector: 'Auto', industry: 'Commercial Vehicles', lotSize: 500 },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company', sector: 'Auto', industry: 'Automobile', lotSize: 200 },
  { symbol: 'BAJAJHLDNG', name: 'Bajaj Holdings', sector: 'Financial', industry: 'Investment', lotSize: 50 },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Materials', industry: 'Cement', lotSize: 50 },
  { symbol: 'TIINDIA', name: 'Tube Investments India', sector: 'Auto', industry: 'Auto Components', lotSize: 150 },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries', sector: 'Auto', industry: 'Tyres', lotSize: 150 },
  { symbol: 'SONACOMS', name: 'Sona BLW Precision', sector: 'Auto', industry: 'Auto Components', lotSize: 150 },
  
  // More Metal & Mining
  { symbol: 'HINDCOPPER', name: 'Hindustan Copper Ltd', sector: 'Materials', industry: 'Mining', lotSize: 1300 },
  { symbol: 'NATIONALUM', name: 'National Aluminium', sector: 'Materials', industry: 'Aluminum', lotSize: 3500 },
  { symbol: 'RATNAMANI', name: 'Ratnamani Metals', sector: 'Materials', industry: 'Steel Pipes', lotSize: 100 },
  { symbol: 'APLAPOLLO', name: 'APL Apollo Tubes', sector: 'Materials', industry: 'Steel Pipes', lotSize: 150 },
  { symbol: 'WELCORP', name: 'Welspun Corp Ltd', sector: 'Materials', industry: 'Steel Pipes', lotSize: 600 },
  { symbol: 'SAIL', name: 'Steel Authority of India', sector: 'Materials', industry: 'Steel', lotSize: 2000 },
  { symbol: 'MOIL', name: 'MOIL Ltd', sector: 'Materials', industry: 'Mining', lotSize: 400 },
  { symbol: 'GMMPFAUDLR', name: 'GMM Pfaudler Ltd', sector: 'Industrial', industry: 'Engineering', lotSize: 75 },
  
  // More Energy & Power
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', sector: 'Energy', industry: 'Power', lotSize: 1000 },
  { symbol: 'TATAPOWER', name: 'Tata Power Co Ltd', sector: 'Energy', industry: 'Power', lotSize: 600 },
  { symbol: 'JSWENERGY', name: 'JSW Energy Ltd', sector: 'Energy', industry: 'Power', lotSize: 400 },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Energy', industry: 'Renewable Energy', lotSize: 250 },
  { symbol: 'NHPC', name: 'NHPC Ltd', sector: 'Energy', industry: 'Power', lotSize: 2500 },
  { symbol: 'SJVN', name: 'SJVN Ltd', sector: 'Energy', industry: 'Power', lotSize: 2500 },
  { symbol: 'THERMAX', name: 'Thermax Ltd', sector: 'Industrial', industry: 'Engineering', lotSize: 50 },
  { symbol: 'ABBOTINDIA', name: 'Abbott India Ltd', sector: 'Healthcare', industry: 'Pharma', lotSize: 25 },
  
  // More FMCG & Consumer
  { symbol: 'HATSUN', name: 'Hatsun Agro Products', sector: 'FMCG', industry: 'Dairy', lotSize: 200 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG', industry: 'Food', lotSize: 100 },
  { symbol: 'RADICO', name: 'Radico Khaitan Ltd', sector: 'FMCG', industry: 'Beverages', lotSize: 200 },
  { symbol: 'UBL', name: 'United Breweries Ltd', sector: 'FMCG', industry: 'Beverages', lotSize: 150 },
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail', industry: 'Retail', lotSize: 100 },
  { symbol: 'SHOPPERSSTP', name: 'Shoppers Stop', sector: 'Retail', industry: 'Retail', lotSize: 200 },
  { symbol: 'ABFRL', name: 'Aditya Birla Fashion', sector: 'Retail', industry: 'Fashion', lotSize: 400 },
  { symbol: 'TCIEXP', name: 'TCI Express Ltd', sector: 'Logistics', industry: 'Logistics', lotSize: 150 },
  
  // More Infrastructure & Real Estate
  { symbol: 'DLF', name: 'DLF Ltd', sector: 'Real Estate', industry: 'Real Estate', lotSize: 250 },
  { symbol: 'GODREJPROP', name: 'Godrej Properties', sector: 'Real Estate', industry: 'Real Estate', lotSize: 150 },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty', sector: 'Real Estate', industry: 'Real Estate', lotSize: 100 },
  { symbol: 'PHOENIXLTD', name: 'Phoenix Mills Ltd', sector: 'Real Estate', industry: 'Real Estate', lotSize: 100 },
  { symbol: 'SOBHA', name: 'Sobha Ltd', sector: 'Real Estate', industry: 'Real Estate', lotSize: 150 },
  { symbol: 'PRESTIGE', name: 'Prestige Estates', sector: 'Real Estate', industry: 'Real Estate', lotSize: 150 },
  { symbol: 'BRIGADE', name: 'Brigade Enterprises', sector: 'Real Estate', industry: 'Real Estate', lotSize: 250 },
  { symbol: 'IBREALEST', name: 'Indiabulls Real Estate', sector: 'Real Estate', industry: 'Real Estate', lotSize: 500 },
  { symbol: 'NCC', name: 'Nagarjuna Construction', sector: 'Infrastructure', industry: 'Construction', lotSize: 700 },
  { symbol: 'IRB', name: 'IRB Infrastructure', sector: 'Infrastructure', industry: 'Roads', lotSize: 300 },
  { symbol: 'GMRINFRA', name: 'GMR Infrastructure', sector: 'Infrastructure', industry: 'Infrastructure', lotSize: 2000 },
  { symbol: 'GALLANTT', name: 'Gallantt Ispat Ltd', sector: 'Materials', industry: 'Steel', lotSize: 200 },
  
  // Indices
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', sector: 'Index', industry: 'Index', lotSize: 25 },
  { symbol: 'NIFTY BANK', name: 'Nifty Bank Index', sector: 'Index', industry: 'Index', lotSize: 15 },
  { symbol: 'NIFTY IT', name: 'Nifty IT Index', sector: 'Index', industry: 'Index', lotSize: 25 },
  { symbol: 'NIFTY FIN SERVICE', name: 'Nifty Fin Service', sector: 'Index', industry: 'Index', lotSize: 25 },
  { symbol: 'NIFTY MID SELECT', name: 'Nifty Midcap Select', sector: 'Index', industry: 'Index', lotSize: 50 },
  
  // More Chemicals
  { symbol: 'TATAVAPE', name: 'Tata VAPE', sector: 'Chemicals', industry: 'Chemicals', lotSize: 100 },
  { symbol: 'NAVINFLUOR', name: 'Navin Fluorine', sector: 'Chemicals', industry: 'Chemicals', lotSize: 100 },
  { symbol: 'GUJALKALI', name: 'Gujarat Alkalies', sector: 'Chemicals', industry: 'Chemicals', lotSize: 500 },
  { symbol: 'DCMSHRADHA', name: 'DCM Shriram Ltd', sector: 'Chemicals', industry: 'Chemicals', lotSize: 200 },
  { symbol: 'BALRAMCHIN', name: 'Balrampur Chini', sector: 'FMCG', industry: 'Sugar', lotSize: 500 },
  { symbol: 'EIDPARRY', name: 'EID Parry India', sector: 'FMCG', industry: 'Sugar', lotSize: 300 },
  
  // More Media & Entertainment
  { symbol: 'SUNTV', name: 'Sun TV Network', sector: 'Media', industry: 'Media', lotSize: 200 },
  { symbol: 'NETWORK18', name: 'Network18 Media', sector: 'Media', industry: 'Media', lotSize: 400 },
  { symbol: 'TV18BRDCST', name: 'TV18 Broadcast', sector: 'Media', industry: 'Media', lotSize: 1000 },
  { symbol: 'ZEEL', name: 'Zee Entertainment', sector: 'Media', industry: 'Media', lotSize: 500 },
  
  // More Telecom
  { symbol: 'BHARTIHEXA', name: 'Bharti Hexacom', sector: 'Telecom', industry: 'Telecom Services', lotSize: 100 },
  
  // Miscellaneous
  { symbol: 'BALMLAWRIE', name: 'Balmer Lawrie', sector: 'Industrial', industry: 'Industrial', lotSize: 400 },
  { symbol: 'BEML', name: 'BEML Ltd', sector: 'Industrial', industry: 'Engineering', lotSize: 150 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics', sector: 'Defense', industry: 'Defense', lotSize: 50 },
  { symbol: 'BEL', name: 'Bharat Electronics', sector: 'Defense', industry: 'Defense', lotSize: 700 },
  { symbol: 'BEML', name: 'BEML Ltd', sector: 'Defense', industry: 'Defense', lotSize: 150 },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard', sector: 'Defense', industry: 'Shipbuilding', lotSize: 100 },
  { symbol: 'MIDHANI', name: 'MIDHANI', sector: 'Defense', industry: 'Defense', lotSize: 250 },
  { symbol: 'SOLARINDS', name: 'Solar Industries', sector: 'Defense', industry: 'Explosives', lotSize: 50 },
  { symbol: 'ASTRAL', name: 'Astral Ltd', sector: 'Industrial', industry: 'Pipes', lotSize: 75 },
  { symbol: 'PRINCEPIPE', name: 'Prince Pipes', sector: 'Industrial', industry: 'Pipes', lotSize: 150 },
  { symbol: 'SUPREMEIND', name: 'Supreme Industries', sector: 'Industrial', industry: 'Pipes', lotSize: 100 },
  { symbol: 'FINPIPE', name: 'Finolex Industries', sector: 'Industrial', industry: 'Pipes', lotSize: 300 },
  
  // Airlines & Tourism
  { symbol: 'EASEMYTRIP', name: 'Easy Trip Planners', sector: 'Services', industry: 'Travel', lotSize: 400 },
  { symbol: 'YATRA', name: 'Yatra Online', sector: 'Services', industry: 'Travel', lotSize: 200 },
  
  // Education
  { symbol: 'CAREERP', name: 'Career Point', sector: 'Services', industry: 'Education', lotSize: 200 },
  
  // Paints
  { symbol: 'BERGEPAINT', name: 'Berger Paints India', sector: 'Consumer', industry: 'Paints', lotSize: 150 },
  { symbol: 'KANSAINER', name: 'Kansai Nerolac', sector: 'Consumer', industry: 'Paints', lotSize: 200 },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation', sector: 'Services', industry: 'Aviation', lotSize: 150 },
  
  // Exchange & Financial Services
  { symbol: 'NSEI', name: 'NSE Indices', sector: 'Financial', industry: 'Financial Services', lotSize: 50 },
  { symbol: 'MCX', name: 'Multi Commodity Exchange', sector: 'Financial', industry: 'Exchange', lotSize: 100 },
  
  // More Auto Components
  { symbol: 'TMCV', name: 'TVS Motor Components', sector: 'Auto', industry: 'Auto Components', lotSize: 200 },
  { symbol: 'TMPV', name: 'TVS Motor Products', sector: 'Auto', industry: 'Auto Components', lotSize: 200 },
  { symbol: 'RICOAUTO', name: 'Rico Auto Industries', sector: 'Auto', industry: 'Auto Components', lotSize: 300 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const sector = searchParams.get('sector') || '';

  try {
    // Ensure all stocks exist in database
    for (const stock of FNO_STOCKS) {
      await db.stock.upsert({
        where: { symbol: stock.symbol },
        update: { 
          name: stock.name, 
          sector: stock.sector, 
          industry: stock.industry, 
          lotSize: stock.lotSize 
        },
        create: stock,
      });
    }

    // Query stocks with filters
    let whereClause: any = { isActive: true };
    
    if (search) {
      whereClause.OR = [
        { symbol: { contains: search.toUpperCase() } },
        { name: { contains: search } },
      ];
    }
    
    if (sector) {
      whereClause.sector = sector;
    }

    const stocks = await db.stock.findMany({
      where: whereClause,
      include: {
        stockData: true,
      },
      orderBy: { symbol: 'asc' },
    });

    // Get unique sectors
    const sectors = FNO_STOCKS.map(s => s.sector).filter((v, i, a) => a.indexOf(v) === i);

    return NextResponse.json({ 
      stocks: stocks.length > 0 ? stocks : FNO_STOCKS,
      sectors,
      total: stocks.length || FNO_STOCKS.length 
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ stocks: FNO_STOCKS, sectors: [], total: FNO_STOCKS.length });
  }
}
