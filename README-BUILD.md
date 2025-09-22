# MOO Music - 本地打包指南

## 环境要求

### 必需软件
1. **Java Development Kit (JDK) 8 或更高版本**
   - 下载地址: https://adoptium.net/
   - 设置 JAVA_HOME 环境变量

2. **Android SDK**
   - 下载 Android Studio: https://developer.android.com/studio
   - 或使用命令行工具: https://developer.android.com/studio/command-line
   - 设置 ANDROID_HOME 环境变量

3. **Node.js 和 npm**
   - 下载地址: https://nodejs.org/
   - 版本要求: Node.js 16+ 

## 快速开始

### 1. 环境设置 (首次使用)
```bash
# Windows
npm run setup:android

# Linux/Mac
npm run build:apk:linux
```

### 2. 一键打包APK
```bash
# Windows
npm run build:apk

# Linux/Mac  
npm run build:apk:linux
```

## 手动构建步骤

### 1. 构建uni-app项目
```bash
npm run build:app-android
```

### 2. 生成签名密钥 (首次)
```bash
cd android/keystore
keytool -genkey -v -keystore moo-music.keystore -alias moo-music -keyalg RSA -keysize 2048 -validity 10000
```

### 3. 构建APK
```bash
cd android
./gradlew assembleRelease
```

### 4. 查找生成的APK
生成的APK文件位置:
- `android/app/build/outputs/apk/release/app-release.apk`
- 或复制到项目根目录: `moo-music-v1.7.0.apk`

## 故障排除

### 常见问题

1. **Java环境问题**
   ```
   错误: JAVA_HOME未设置
   解决: 设置JAVA_HOME环境变量指向JDK安装目录
   ```

2. **Android SDK问题**
   ```
   错误: ANDROID_HOME未设置
   解决: 设置ANDROID_HOME环境变量指向SDK安装目录
   ```

3. **Gradle构建失败**
   ```
   错误: 网络连接问题
   解决: 配置代理或使用国内镜像源
   ```

4. **签名问题**
   ```
   错误: 密钥库文件不存在
   解决: 运行脚本会自动生成，或手动创建密钥库
   ```

### 网络配置
项目已配置支持以下域名的明文流量:
- kele.160622.xyz
- localhost
- 127.0.0.1
- 10.0.2.2

## 自定义配置

### 修改应用信息
编辑 `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.moo.music"  // 包名
    versionCode 1                  // 版本号
    versionName "1.7.0"           // 版本名称
}
```

### 修改应用名称
编辑 `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">MOO Music</string>
```

### 修改应用图标
替换以下文件:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

## 脚本说明

- `build:apk`: Windows一键打包脚本
- `build:apk:linux`: Linux/Mac一键打包脚本  
- `setup:android`: Windows环境设置脚本

所有脚本都会自动处理:
- 环境检查
- 项目构建
- 密钥生成
- APK打包
- 文件复制

## 技术支持

如遇到问题，请检查:
1. 环境变量是否正确设置
2. 网络连接是否正常
3. 磁盘空间是否充足
4. 防火墙/杀毒软件是否阻止