#!/bin/bash

echo "🚀 启动 Iris Program 项目"
echo ""

# 检查是否在项目根目录
if [ ! -d "Server" ] || [ ! -d "Clint" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端服务
echo "📦 启动后端服务..."
cd Server
npm run start:dev &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "   API地址: http://localhost:3000"
echo "   API文档: http://localhost:3000/api-docs"
echo ""

# 等待后端服务启动
echo "⏳ 等待后端服务就绪..."
sleep 5

# 启动前端H5服务
echo "📱 启动前端H5服务..."
cd ../Clint
npm run dev:h5 &
FRONTEND_PID=$!
echo "✅ 前端H5服务已启动 (PID: $FRONTEND_PID)"
echo ""

echo "🎉 所有服务已启动！"
echo ""
echo "📝 测试账号："
echo "   用户名: student1  密码: 123456"
echo "   用户名: student2  密码: 123456"
echo "   用户名: student3  密码: 123456"
echo "   用户名: teacher1  密码: 123456"
echo ""
echo "💡 提示："
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 查看 TEST_GUIDE.md 了解详细测试指南"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT

# 保持脚本运行
wait
