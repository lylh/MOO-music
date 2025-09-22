@echo off
echo ========================================
echo     Android 开发环境自动配置脚本
echo ========================================

echo 此脚本将帮助您配置 Android 开发环境
echo.

:: 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 请以管理员身份运行此脚本
    pause
    exit /b 1
)

echo 1. 检查 Java 环境...
java -version >nul 2>&1
if errorlevel 1 (
    echo Java 未安装，请先安装 JDK 8 或更高版本
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✓ Java 已安装
)

echo.
echo 2. 检查 Android SDK...
if not defined ANDROID_HOME (
    echo Android SDK 未配置
    echo.
    echo 请按照以下步骤手动配置:
    echo 1. 下载 Android Studio: https://developer.android.com/studio
    echo 2. 安装 Android Studio 并下载 SDK
    echo 3. 设置环境变量 ANDROID_HOME 指向 SDK 目录
    echo 4. 将 %%ANDROID_HOME%%\tools 和 %%ANDROID_HOME%%\platform-tools 添加到 PATH
    echo.
    echo 或者使用命令行工具:
    echo 1. 下载 command line tools: https://developer.android.com/studio#command-tools
    echo 2. 解压到 C:\Android\cmdline-tools\latest\
    echo 3. 运行以下命令安装 SDK:
    echo    C:\Android\cmdline-tools\latest\bin\sdkmanager "platforms;android-33" "build-tools;33.0.0"
    pause
) else (
    echo ✓ ANDROID_HOME 已设置: %ANDROID_HOME%
)

echo.
echo 3. 创建快速配置脚本...

:: 创建环境变量设置脚本
(
echo @echo off
echo :: 设置 Android 开发环境变量
echo set ANDROID_HOME=C:\Android\Sdk
echo set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.0.19.7-hotspot
echo set PATH=%%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\platform-tools;%%ANDROID_HOME%%\build-tools\33.0.0;%%PATH%%
echo.
echo echo Android 环境变量已设置
echo echo ANDROID_HOME: %%ANDROID_HOME%%
echo echo JAVA_HOME: %%JAVA_HOME%%
) > set-android-env.bat

echo ✓ 已创建 set-android-env.bat 脚本

echo.
echo 4. 创建 SDK 安装脚本...

:: 创建 SDK 安装脚本
(
echo @echo off
echo echo 正在安装 Android SDK 组件...
echo.
echo if not defined ANDROID_HOME (
echo     echo 请先设置 ANDROID_HOME 环境变量
echo     pause
echo     exit /b 1
echo ^)
echo.
echo %%ANDROID_HOME%%\cmdline-tools\latest\bin\sdkmanager "platforms;android-33"
echo %%ANDROID_HOME%%\cmdline-tools\latest\bin\sdkmanager "build-tools;33.0.0"
echo %%ANDROID_HOME%%\cmdline-tools\latest\bin\sdkmanager "platform-tools"
echo.
echo echo SDK 组件安装完成
echo pause
) > install-android-sdk.bat

echo ✓ 已创建 install-android-sdk.bat 脚本

echo.
echo ========================================
echo 配置完成！
echo.
echo 下一步操作:
echo 1. 安装 Android Studio 或 Command Line Tools
echo 2. 运行 set-android-env.bat 设置环境变量
echo 3. 运行 install-android-sdk.bat 安装 SDK 组件
echo 4. 重启命令行窗口
echo 5. 运行 build-android.bat 开始打包
echo ========================================

pause