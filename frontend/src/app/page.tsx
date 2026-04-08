'use client';

import { useState } from 'react';
import { TrendingUp, BarChart3, Brain } from 'lucide-react';
import { Stock } from '@/lib/api';
import StockSearch from '@/components/StockSearch';
import StockDetail from '@/components/StockDetail';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import HotStocks from '@/components/HotStocks';
import MarketOverview from '@/components/MarketOverview';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Stock Watcher</h1>
              <p className="text-sm text-gray-500">AI智能股票分析</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                股票搜索
              </h2>
              <StockSearch onSelect={setSelectedStock} />
            </div>

            {/* Market Overview */}
            <MarketOverview />

            {/* Stock Detail & AI Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StockDetail stock={selectedStock} />
              <AIAnalysisPanel stock={selectedStock} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <HotStocks onSelect={setSelectedStock} />

            {/* Usage Tips */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5" />
                <h3 className="font-bold">使用说明</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>• 搜索股票代码或名称</li>
                <li>• 选择市场（A股/美股/港股）</li>
                <li>• 点击分析获取AI建议</li>
                <li>• 关注热门股票动态</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs text-blue-200">
                <p>⚠️ 分析结果仅供参考，不构成投资建议</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Stock Watcher © 2026 · AI智能股票分析工具
          </p>
        </div>
      </footer>
    </div>
  );
}
