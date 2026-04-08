# Stock Watcher - 股票盯盘软件

智能股票分析与盯盘系统，支持 A股/美股/港股，集成 AI 分析功能。

## 功能特性

- **多市场支持**: A股、美股、港股实时数据
- **智能搜索**: 股票代码/名称搜索
- **AI 分析**: 基于 Kimi (Moonshot) 的技术面和基本面分析
- **投资建议**: 自动生成买入/持有/卖出建议
- **热门股票**: 实时热门股票追踪
- **市场概览**: 大盘指数监控

## 项目结构

```
stock-watcher/
├── backend/           # Python FastAPI 后端
│   ├── main.py       # API 入口
│   ├── stock_service.py  # 股票数据服务
│   ├── ai_service.py     # AI 分析服务
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # Next.js 前端 (待创建)
```

## 快速开始

### 后端启动

#### Windows
```bash
cd backend
start.bat
```

#### macOS/Linux
```bash
cd backend
chmod +x start.sh
./start.sh
```

### 配置 API Key

1. 复制环境变量文件：
```bash
cp backend/.env.example backend/.env
```

2. 编辑 `.env` 文件，填入你的 Moonshot API Key：
```env
MOONSHOT_API_KEY=your_api_key_here
```

获取 API Key: https://platform.moonshot.cn/

### API 接口

启动后访问 http://localhost:8000/docs 查看完整 API 文档。

主要接口：

- `POST /api/stocks/search` - 搜索股票
- `GET /api/stocks/{code}` - 股票详情
- `POST /api/stocks/analyze` - AI 分析
- `GET /api/stocks/hot/{market}` - 热门股票

## 技术栈

### 后端
- **FastAPI**: 高性能 API 框架
- **AKShare**: A股/港股数据
- **yfinance**: 美股数据
- **OpenAI SDK**: Kimi API 调用

### 前端 (计划中)
- **Next.js**: React 全栈框架
- **Tailwind CSS**: 样式框架

## 免责声明

本软件仅供学习研究使用，不构成投资建议。股市有风险，投资需谨慎。

## License

MIT
