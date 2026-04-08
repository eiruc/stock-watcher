@echo off
chcp 65001
echo 启动 Stock Watcher 后端服务...
echo.

REM 检查是否安装了依赖
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate

REM 安装依赖
echo 安装依赖...
pip install -r requirements.txt -q

REM 启动服务
echo.
echo 服务启动中...
echo API 地址: http://localhost:8000
echo 文档地址: http://localhost:8000/docs
echo.
python main.py

pause
