@echo off
chcp 65001 >nul
echo 🚀 启动 Iris Program 项目
echo.

REM 检查是否在项目根目录
if not exist "Server" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "Clint" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 启动后端服务
echo 📦 启动后端服务...
cd Server
start "Iris-Backend" cmd /k "npm run start:dev"
echo ✅ 后端服务已启动
echo    API地址: http://localhost:3000
echo    API文档: http://localhost:3000/api-docs
echo.

REM 等待后端服务启动
echo ⏳ 等待后端服务就绪...
timeout /t 5 /nobreak >nul

REM 启动前端H5服务
echo 📱 启动前端H5服务...
cd ..\Clint
start "Iris-Frontend-H5" cmd /k "npm run dev:h5"
echo ✅ 前端H5服务已启动
echo.

echo 🎉 所有服务已启动！
echo.
echo 📝 测试账号：
echo    用户名: student1  密码: 123456
echo    用户名: student2  密码: 123456
echo    用户名: student3  密码: 123456
echo    用户名: teacher1  密码: 123456
echo.
echo 💡 提示：
echo    - 关闭命令行窗口即可停止对应服务
echo    - 查看 TEST_GUIDE.md 了解详细测试指南
echo.

cd ..
pause
