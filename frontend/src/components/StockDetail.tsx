'use client';

import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Clock } from 'lucide-react';
import { Stock } from '@/lib/api';

interface StockDetailProps {
  stock: Stock | null;
}

export default function StockDetail({ stock }: StockDetailProps) {
  if (!stock) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3" />
          <p>选择股票查看详情</p>
        </div>
      </div>
    );
  }

  const isUp = stock.change > 0;
  const colorClass = isUp ? 'text-red-600' : stock.change < 0 ? 'text-green-600' : 'text-gray-600';
  const bgClass = isUp ? 'bg-red-50' : stock.change < 0 ? 'bg-green-50' : 'bg-gray-50';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stock.name}</h2>
          <p className="text-gray-500">{stock.code} · {stock.market}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${colorClass}`}>
          {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)}%
        </div>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">¥{stock.price?.toFixed(2)}</span>
        {stock.change_amount !== undefined && (
          <span className={`ml-3 text-lg ${colorClass}`}>
            {stock.change_amount > 0 ? '+' : ''}{stock.change_amount?.toFixed(2)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Activity className="w-4 h-4" />
            <span>今开</span>
          </div>
          <p className="font-medium">{stock.open?.toFixed(2) || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>昨收</span>
          </div>
          <p className="font-medium">{stock.prev_close?.toFixed(2) || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>最高</span>
          </div>
          <p className="font-medium">{stock.high?.toFixed(2) || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>最低</span>
          </div>
          <p className="font-medium">{stock.low?.toFixed(2) || '-'}</p>
        </div>

        {stock.pe !== undefined && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              <span>市盈率</span>
            </div>
            <p className="font-medium">{stock.pe ? stock.pe.toFixed(2) : '-'}</p>
          </div>
        )}

        {stock.pb !== undefined && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>市净率</span>
            </div>
            <p className="font-medium">{stock.pb ? stock.pb.toFixed(2) : '-'}</p>
          </div>
        )}

        {stock.volume !== undefined && (
          <div className="bg-gray-50 p-3 rounded-lg col-span-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Activity className="w-4 h-4" />
              <span>成交量</span>
            </div>
            <p className="font-medium">{(stock.volume / 10000)?.toFixed(2)} 万手</p>
          </div>
        )}
      </div>
    </div>
  );
}
