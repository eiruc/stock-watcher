'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, MessageSquare, Loader2 } from 'lucide-react';
import { stockApi, Stock, AIAnalysis } from '@/lib/api';

interface AIAnalysisPanelProps {
  stock: Stock | null;
}

export default function AIAnalysisPanel({ stock }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!stock) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await stockApi.analyzeStock(stock.code, stock.market);
        setAnalysis(data.analysis);
      } catch (err) {
        setError('AI分析失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [stock]);

  if (!stock) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>选择一支股票进行AI分析</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="text-gray-600">AI正在分析中...</p>
          <p className="text-sm text-gray-400 mt-1">{stock.name} ({stock.code})</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center text-red-500">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const getSuggestionColor = (suggestion: string) => {
    if (suggestion.includes('买入') || suggestion.includes('关注')) return 'bg-green-100 text-green-800';
    if (suggestion.includes('卖出') || suggestion.includes('减持')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getRiskColor = (risk: string) => {
    if (risk === '高') return 'text-red-600';
    if (risk === '低') return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI 智能分析</h3>
          <p className="text-sm text-gray-500">{stock.name} ({stock.code})</p>
        </div>
      </div>

      {/* 建议标签 */}
      <div className="flex gap-3 mb-6">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSuggestionColor(analysis.suggestion)}`}>
          {analysis.suggestion}
        </span>
        <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gray-100`}>
          情绪: {analysis.sentiment}
        </span>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">风险等级</span>
          </div>
          <p className={`text-lg font-bold ${getRiskColor(analysis.risk_level)}`}>
            {analysis.risk_level}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm">目标价位</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analysis.target_price}</p>
        </div>
      </div>

      {/* 详细分析 */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">分析详情</span>
        </div>
        <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {analysis.full_analysis}
        </div>
      </div>
    </div>
  );
}
