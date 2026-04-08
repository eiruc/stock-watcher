"""
股票数据服务
支持 A股、美股、港股数据获取
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class StockService:
    """股票数据服务类"""

    def __init__(self):
        self.cache = {}
        self.cache_time = {}

    def search_stock(self, keyword: str, market: str = "A") -> List[Dict]:
        """
        搜索股票

        Args:
            keyword: 股票代码或名称
            market: A(港股), US(美股), HK(港股)

        Returns:
            股票列表
        """
        results = []

        try:
            if market in ["A", "all"]:
                # A股搜索
                try:
                    stock_info = ak.stock_zh_a_spot_em()
                    matched = stock_info[
                        stock_info["名称"].str.contains(keyword, na=False) |
                        stock_info["代码"].str.contains(keyword, na=False)
                    ]
                    for _, row in matched.head(10).iterrows():
                        results.append({
                            "code": row["代码"],
                            "name": row["名称"],
                            "market": "A股",
                            "price": row.get("最新价", 0),
                            "change": row.get("涨跌幅", 0),
                        })
                except Exception as e:
                    print(f"A股搜索错误: {e}")

            if market in ["HK", "all"]:
                # 港股搜索
                try:
                    stock_info = ak.stock_hk_spot_em()
                    matched = stock_info[
                        stock_info["名称"].str.contains(keyword, na=False) |
                        stock_info["代码"].str.contains(keyword, na=False)
                    ]
                    for _, row in matched.head(10).iterrows():
                        results.append({
                            "code": row["代码"],
                            "name": row["名称"],
                            "market": "港股",
                            "price": row.get("最新价", 0),
                            "change": row.get("涨跌幅", 0),
                        })
                except Exception as e:
                    print(f"港股搜索错误: {e}")

            if market in ["US", "all"]:
                # 美股搜索使用yfinance
                try:
                    ticker = yf.Ticker(keyword)
                    info = ticker.info
                    if info and info.get("symbol"):
                        results.append({
                            "code": info.get("symbol"),
                            "name": info.get("longName") or info.get("shortName", keyword),
                            "market": "美股",
                            "price": info.get("currentPrice", 0) or info.get("regularMarketPrice", 0),
                            "change": info.get("regularMarketChangePercent", 0),
                        })
                except Exception as e:
                    print(f"美股搜索错误: {e}")

        except Exception as e:
            print(f"搜索错误: {e}")

        return results

    def get_stock_detail(self, code: str, market: str) -> Dict:
        """
        获取股票详细信息
        """
        try:
            if market == "A股":
                # 获取A股实时数据
                df = ak.stock_zh_a_spot_em()
                stock = df[df["代码"] == code]
                if not stock.empty:
                    row = stock.iloc[0]
                    return {
                        "code": code,
                        "name": row["名称"],
                        "market": "A股",
                        "price": row.get("最新价", 0),
                        "change": row.get("涨跌幅", 0),
                        "change_amount": row.get("涨跌额", 0),
                        "volume": row.get("成交量", 0),
                        "turnover": row.get("成交额", 0),
                        "high": row.get("最高", 0),
                        "low": row.get("最低", 0),
                        "open": row.get("开盘", 0),
                        "prev_close": row.get("昨收", 0),
                        "pe": row.get("市盈率-动态", None),
                        "pb": row.get("市净率", None),
                        "market_cap": row.get("总市值", None),
                    }

            elif market == "港股":
                df = ak.stock_hk_spot_em()
                stock = df[df["代码"] == code]
                if not stock.empty:
                    row = stock.iloc[0]
                    return {
                        "code": code,
                        "name": row["名称"],
                        "market": "港股",
                        "price": row.get("最新价", 0),
                        "change": row.get("涨跌幅", 0),
                        "volume": row.get("成交量", 0),
                    }

            elif market == "美股":
                ticker = yf.Ticker(code)
                info = ticker.info
                hist = ticker.history(period="5d")

                return {
                    "code": code,
                    "name": info.get("longName") or info.get("shortName", code),
                    "market": "美股",
                    "price": info.get("currentPrice") or info.get("regularMarketPrice", 0),
                    "change": info.get("regularMarketChangePercent", 0),
                    "market_cap": info.get("marketCap"),
                    "pe": info.get("trailingPE"),
                    "pb": info.get("priceToBook"),
                    "sector": info.get("sector"),
                    "industry": info.get("industry"),
                    "52_week_high": info.get("fiftyTwoWeekHigh"),
                    "52_week_low": info.get("fiftyTwoWeekLow"),
                }

        except Exception as e:
            print(f"获取股票详情错误: {e}")

        return {}

    def get_stock_history(self, code: str, market: str, period: str = "1mo") -> pd.DataFrame:
        """
        获取股票历史数据
        """
        try:
            if market in ["A股", "港股"]:
                # 使用akshare获取历史数据
                if market == "A股":
                    df = ak.stock_zh_a_hist(symbol=code, period="daily", adjust="qfq")
                else:
                    df = ak.stock_hk_hist(symbol=code, period="daily", adjust="qfq")

                # 转换列名
                df = df.rename(columns={
                    "日期": "date",
                    "开盘": "open",
                    "收盘": "close",
                    "最高": "high",
                    "最低": "low",
                    "成交量": "volume",
                })
                return df

            elif market == "美股":
                ticker = yf.Ticker(code)
                hist = ticker.history(period=period)
                hist = hist.reset_index()
                hist.columns = [c.lower().replace(" ", "_") for c in hist.columns]
                return hist

        except Exception as e:
            print(f"获取历史数据错误: {e}")

        return pd.DataFrame()

    def get_hot_stocks(self, market: str = "A") -> List[Dict]:
        """
        获取热门股票
        """
        try:
            if market == "A":
                # 获取涨幅排行
                df = ak.stock_zh_a_spot_em()
                df = df.sort_values("涨跌幅", ascending=False)

                results = []
                for _, row in df.head(20).iterrows():
                    results.append({
                        "code": row["代码"],
                        "name": row["名称"],
                        "price": row.get("最新价", 0),
                        "change": row.get("涨跌幅", 0),
                        "volume": row.get("成交量", 0),
                    })
                return results

        except Exception as e:
            print(f"获取热门股票错误: {e}")

        return []
