'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { stockApi, Stock } from '@/lib/api';

interface StockSearchProps {
  onSelect: (stock: Stock) => void;
}

export default function StockSearch({ onSelect }: StockSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState('all');

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const data = await stockApi.searchStocks(keyword, market);
      setResults(data);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部市场</option>
          <option value="A">A股</option>
          <option value="US">美股</option>
          <option value="HK">港股</option>
        </select>

        <div className="flex-1 relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入股票代码或名称..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
        </button>
      </div>

      {/* 搜索结果 */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">代码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">市场</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">价格</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">涨跌幅</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((stock) => (
                <tr key={`${stock.code}-${stock.market}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{stock.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{stock.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{stock.market}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ¥{stock.price?.toFixed(2) || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    stock.change > 0 ? 'text-red-600' : stock.change < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2) || '-'}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onSelect(stock)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      分析
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
