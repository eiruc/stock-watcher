"""
Stock Watcher - 股票盯盘软件 API
FastAPI 后端服务
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from stock_service import StockService
from ai_service import AIService

load_dotenv()

app = FastAPI(
    title="Stock Watcher API",
    description="股票盯盘软件 API - 支持A股/美股/港股",
    version="1.0.0",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
stock_service = StockService()
ai_service = AIService()


# 数据模型
class StockSearchRequest(BaseModel):
    keyword: str
    market: str = "all"  # A, US, HK, all


class StockAnalysisRequest(BaseModel):
    code: str
    market: str
    name: Optional[str] = None


class StockInfo(BaseModel):
    code: str
    name: str
    market: str
    price: float
    change: float


class AnalysisResult(BaseModel):
    summary: str
    full_analysis: str
    suggestion: str
    risk_level: str
    sentiment: str
    target_price: str


# API 路由
@app.get("/")
def root():
    return {
        "message": "Stock Watcher API 运行中",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/api/stocks/search", response_model=List[StockInfo])
def search_stocks(request: StockSearchRequest):
    """
    搜索股票
    """
    try:
        results = stock_service.search_stock(request.keyword, request.market)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/{code}")
def get_stock_detail(code: str, market: str):
    """
    获取股票详细信息
    """
    try:
        detail = stock_service.get_stock_detail(code, market)
        if not detail:
            raise HTTPException(status_code=404, detail="股票未找到")
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/{code}/history")
def get_stock_history(code: str, market: str, period: str = "1mo"):
    """
    获取股票历史数据
    """
    try:
        import pandas as pd
        df = stock_service.get_stock_history(code, market, period)

        if df.empty:
            return {"data": []}

        # 转换为 JSON 格式
        df = df.reset_index(drop=True)
        df = df.fillna(0)

        # 确保所有值都是可序列化的
        for col in df.columns:
            if df[col].dtype == 'datetime64[ns]':
                df[col] = df[col].astype(str)

        return {"data": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stocks/analyze")
def analyze_stock(request: StockAnalysisRequest):
    """
    AI 分析股票
    """
    try:
        # 获取股票详情
        stock_data = stock_service.get_stock_detail(request.code, request.market)

        if not stock_data:
            raise HTTPException(status_code=404, detail="股票未找到")

        # 获取历史数据
        history_df = stock_service.get_stock_history(
            request.code, request.market, period="1mo"
        )

        history_data = []
        if not history_df.empty:
            history_data = history_df.tail(30).to_dict(orient="records")

        # AI 分析
        analysis = ai_service.analyze_stock(stock_data, history_data)

        return {
            "stock": stock_data,
            "analysis": analysis,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/hot/{market}")
def get_hot_stocks(market: str = "A"):
    """
    获取热门股票
    """
    try:
        stocks = stock_service.get_hot_stocks(market)

        # 批量 AI 分析
        analyzed_stocks = ai_service.batch_analyze(stocks[:10])

        return {"stocks": analyzed_stocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market/overview")
def get_market_overview():
    """
    获取市场概览
    """
    try:
        # A股大盘指数
        import akshare as ak

        indices = []

        try:
            # 上证指数
            sh_index = ak.index_zh_a_spot_em()
            sh_data = sh_index[sh_index["名称"] == "上证指数"]
            if not sh_data.empty:
                row = sh_data.iloc[0]
                indices.append({
                    "name": "上证指数",
                    "code": "000001",
                    "price": row.get("最新价", 0),
                    "change": row.get("涨跌幅", 0),
                })
        except:
            pass

        try:
            # 深证成指
            sz_data = sh_index[sh_index["名称"] == "深证成指"]
            if not sz_data.empty:
                row = sz_data.iloc[0]
                indices.append({
                    "name": "深证成指",
                    "code": "399001",
                    "price": row.get("最新价", 0),
                    "change": row.get("涨跌幅", 0),
                })
        except:
            pass

        try:
            # 创业板指
            cy_data = sh_index[sh_index["名称"] == "创业板指"]
            if not cy_data.empty:
                row = cy_data.iloc[0]
                indices.append({
                    "name": "创业板指",
                    "code": "399006",
                    "price": row.get("最新价", 0),
                    "change": row.get("涨跌幅", 0),
                })
        except:
            pass

        return {
            "indices": indices,
            "update_time": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"indices": [], "error": str(e)}


# 导入 datetime
from datetime import datetime


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
