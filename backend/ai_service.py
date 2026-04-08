"""
AI 分析服务
使用 Moonshot (Kimi) API 进行股票分析
"""

import os
from typing import Dict, List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class AIService:
    """AI 分析服务"""

    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("MOONSHOT_API_KEY"),
            base_url=os.getenv("MOONSHOT_BASE_URL", "https://api.moonshot.cn/v1"),
        )
        self.model = os.getenv("MOONSHOT_MODEL", "moonshot-v1-8k")

    def analyze_stock(self, stock_data: Dict, history_data: List[Dict]) -> Dict:
        """
        分析股票并给出建议

        Args:
            stock_data: 股票基本信息
            history_data: 历史数据

        Returns:
            分析结果和建议
        """
        # 构建提示词
        prompt = self._build_analysis_prompt(stock_data, history_data)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位专业的股票分析师，擅长技术分析和基本面分析。请基于提供的数据给出客观的分析和投资建议。注意：这仅供参考，不构成投资建议。"
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500,
            )

            analysis_text = response.choices[0].message.content

            # 解析分析结果
            return self._parse_analysis(analysis_text, stock_data)

        except Exception as e:
            print(f"AI 分析错误: {e}")
            return {
                "summary": "分析失败",
                "suggestion": "请稍后重试",
                "risk_level": "未知",
                "sentiment": "中性",
            }

    def _build_analysis_prompt(self, stock_data: Dict, history_data: List[Dict]) -> str:
        """构建分析提示词"""

        # 计算一些技术指标
        if history_data and len(history_data) >= 5:
            recent_prices = [d.get("close", 0) for d in history_data[-5:]]
            avg_5d = sum(recent_prices) / len(recent_prices) if recent_prices else 0

            if len(history_data) >= 20:
                prices_20d = [d.get("close", 0) for d in history_data[-20:]]
                avg_20d = sum(prices_20d) / len(prices_20d)
            else:
                avg_20d = avg_5d
        else:
            avg_5d = avg_20d = stock_data.get("price", 0)

        prompt = f"""请分析以下股票：

【股票信息】
- 代码: {stock_data.get('code')}
- 名称: {stock_data.get('name')}
- 市场: {stock_data.get('market')}
- 当前价格: {stock_data.get('price')}
- 涨跌幅: {stock_data.get('change')}%
- 5日均线: {avg_5d:.2f}
- 20日均线: {avg_20d:.2f}
- 市盈率: {stock_data.get('pe', 'N/A')}
- 市净率: {stock_data.get('pb', 'N/A')}

请从以下几个方面进行分析：

1. **技术面分析**
   - 当前价格与均线的关系
   - 短期趋势判断

2. **基本面分析**
   - 估值水平（PE、PB）
   - 与行业平均水平对比

3. **投资建议**
   - 短期操作建议（买入/持有/观望/卖出）
   - 目标价位区间
   - 风险提示

4. **市场情绪**
   - 当前市场情绪判断
   - 需要注意的风险因素

请用中文回答，格式清晰，客观分析。"""

        return prompt

    def _parse_analysis(self, text: str, stock_data: Dict) -> Dict:
        """解析 AI 返回的分析文本"""

        # 简单的关键词提取来判断建议类型
        suggestion = "观望"
        risk_level = "中等"
        sentiment = "中性"

        text_lower = text.lower()

        # 判断建议
        if any(kw in text_lower for kw in ["买入", "推荐", "看好", "机会"]):
            suggestion = "买入/关注"
        elif any(kw in text_lower for kw in ["卖出", "减持", "风险", "谨慎"]):
            suggestion = "卖出/减持"
        elif any(kw in text_lower for kw in ["持有", "观望", "等待"]):
            suggestion = "持有/观望"

        # 判断风险等级
        if any(kw in text_lower for kw in ["高风险", "注意风险", "波动大"]):
            risk_level = "高"
        elif any(kw in text_lower for kw in ["低风险", "稳健", "安全边际"]):
            risk_level = "低"

        # 判断情绪
        if any(kw in text_lower for kw in ["乐观", "积极", "上涨", "突破"]):
            sentiment = "乐观"
        elif any(kw in text_lower for kw in ["悲观", "消极", "下跌", "压力"]):
            sentiment = "悲观"

        return {
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "full_analysis": text,
            "suggestion": suggestion,
            "risk_level": risk_level,
            "sentiment": sentiment,
            "target_price": self._extract_target_price(text),
        }

    def _extract_target_price(self, text: str) -> str:
        """提取目标价位"""
        import re

        # 匹配价格模式
        patterns = [
            r'目标价[：:]\s*(\d+\.?\d*)',
            r'目标价位[：:]\s*(\d+\.?\d*)',
            r'([\d-]+\s*-\s*[\d\.]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)

        return "未明确给出"

    def batch_analyze(self, stocks: List[Dict]) -> List[Dict]:
        """
        批量分析多只股票
        """
        results = []

        for stock in stocks:
            # 简化版分析，不使用历史数据
            result = self._quick_analyze(stock)
            results.append({
                **stock,
                "ai_analysis": result
            })

        return results

    def _quick_analyze(self, stock: Dict) -> Dict:
        """快速分析单只股票"""

        prompt = f"""快速分析股票 {stock.get('name')}({stock.get('code')}):
- 当前价格: {stock.get('price')}
- 涨跌幅: {stock.get('change')}%
- 市场: {stock.get('market')}

请用一句话总结建议（买入/观望/卖出），并给出简短理由。"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是股票分析师，请给出简短专业的分析。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200,
            )

            return {
                "suggestion": response.choices[0].message.content,
                "risk_level": "待详细分析",
            }

        except Exception as e:
            return {
                "suggestion": "分析失败",
                "risk_level": "未知",
            }
