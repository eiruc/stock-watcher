#!/bin/bash

echo "启动 Stock Watcher 后端服务..."
echo ""

# 检查是否安装了依赖
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt -q

# 启动服务
echo ""
echo "服务启动中..."
echo "API 地址: http://localhost:8000"
echo "文档地址: http://localhost:8000/docs"
echo ""
python main.py
