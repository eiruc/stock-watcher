/**
 * API 服务
 * 与后端 FastAPI 交互
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 股票类型
export interface Stock {
  code: string;
  name: string;
  market: string;
  price: number;
  change: number;
  change_amount?: number;
  volume?: number;
  turnover?: number;
  high?: number;
  low?: number;
  open?: number;
  prev_close?: number;
  pe?: number;
  pb?: number;
  market_cap?: number;
}

// AI分析结果
export interface AIAnalysis {
  summary: string;
  full_analysis: string;
  suggestion: string;
  risk_level: string;
  sentiment: string;
  target_price: string;
}

// 市场指数
export interface MarketIndex {
  name: string;
  code: string;
  price: number;
  change: number;
}

// API 函数
export const stockApi = {
  // 搜索股票
  searchStocks: async (keyword: string, market: string = 'all'): Promise<Stock[]> => {
    const response = await api.post('/api/stocks/search', { keyword, market });
    return response.data;
  },

  // 获取股票详情
  getStockDetail: async (code: string, market: string): Promise<Stock> => {
    const response = await api.get(`/api/stocks/${code}`, { params: { market } });
    return response.data;
  },

  // AI分析股票
  analyzeStock: async (code: string, market: string): Promise<{ stock: Stock; analysis: AIAnalysis }> => {
    const response = await api.post('/api/stocks/analyze', { code, market });
    return response.data;
  },

  // 获取热门股票
  getHotStocks: async (market: string = 'A'): Promise<{ stocks: Stock[] }> => {
    const response = await api.get(`/api/stocks/hot/${market}`);
    return response.data;
  },

  // 获取市场概览
  getMarketOverview: async (): Promise<{ indices: MarketIndex[] }> => {
    const response = await api.get('/api/market/overview');
    return response.data;
  },

  // 获取历史数据
  getStockHistory: async (code: string, market: string, period: string = '1mo') => {
    const response = await api.get(`/api/stocks/${code}/history`, {
      params: { market, period },
    });
    return response.data;
  },
};

export default api;
