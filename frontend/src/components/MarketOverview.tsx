'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { stockApi, MarketIndex } from '@/lib/api';

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTime, setUpdateTime] = useState('');

  useEffect(() => {
    fetchMarketData();
    // 每30秒刷新一次
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const data = await stockApi.getMarketOverview();
      setIndices(data.indices || []);
      setUpdateTime(new Date().toLocaleTimeString('zh-CN'));
    } catch (error) {
      console.error('获取市场数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">市场概览</h3>
            <p className="text-xs text-gray-500">更新时间: {updateTime}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((index) => (
            <div key={index.code} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{index.name}</p>
              <p className="text-xl font-bold text-gray-900">{index.price?.toFixed(2)}</p>
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                index.change > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {index.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{index.change > 0 ? '+' : ''}{index.change?.toFixed(2)}%</span>
              </div>
            </div>
          ))}

          {indices.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              暂无市场数据
            </div>
          )}
        </div>
      )}
    </div>
  );
}
