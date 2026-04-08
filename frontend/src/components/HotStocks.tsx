'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { stockApi, Stock } from '@/lib/api';

interface HotStocksProps {
  onSelect: (stock: Stock) => void;
}

export default function HotStocks({ onSelect }: HotStocksProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('A');

  useEffect(() => {
    fetchHotStocks();
  }, [market]);

  const fetchHotStocks = async () => {
    setLoading(true);
    try {
      const data = await stockApi.getHotStocks(market);
      setStocks(data.stocks || []);
    } catch (error) {
      console.error('获取热门股票失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">热门股票</h3>
        </div>

        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="A">A股</option>
          <option value="US">美股</option>
          <option value="HK">港股</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {stocks.map((stock, index) => (
            <div
              key={`${stock.code}-${index}`}
              onClick={() => onSelect(stock)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold ${
                  index < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{stock.name}</p>
                  <p className="text-sm text-gray-500">{stock.code}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">¥{stock.price?.toFixed(2)}</p>
                <div className={`flex items-center gap-1 text-sm ${
                  stock.change > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stock.change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
