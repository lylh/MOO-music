#!/bin/bash

echo "========================================"
echo "       MOO Music Android 一键打包"
echo "========================================"

# 检查环境变量
if [ -z "$ANDROID_HOME" ]; then
    echo "错误: 未设置 ANDROID_HOME 环境变量"
    echo "请先安装 Android SDK 并设置环境变量"
    exit 1
fi

if [ -z "$JAVA_HOME" ]; then
    echo "错误: 未设置 JAVA_HOME 环境变量"
    echo "请先安装 JDK 并设置环境变量"
    exit 1
fi

echo "1. 清理旧的构建文件..."
rm -rf dist/build/app

echo "2. 构建 uni-app 项目..."
npm run build:app-android
if [ $? -ne 0 ]; then
    echo "构建失败!"
    exit 1
fi

echo "3. 检查构建输出..."
if [ ! -d "dist/build/app" ]; then
    echo "构建输出目录不存在!"
    exit 1
fi

echo "4. 复制到 Android 项目目录..."
mkdir -p android-project
cp -r dist/build/app/* android-project/

echo "5. 进入 Android 项目目录..."
cd android-project

echo "6. 生成签名密钥 (如果不存在)..."
if [ ! -f "app.keystore" ]; then
    echo "正在生成调试签名密钥..."
    $JAVA_HOME/bin/keytool -genkey -v -keystore app.keystore -alias moo -keyalg RSA -keysize 2048 -validity 10000 -storepass 123456 -keypass 123456 -dname "CN=MOO Music, OU=Dev, O=MOO, L=City, S=State, C=CN"
fi

echo "7. 创建 Gradle 构建文件..."
create_gradle_files

echo "8. 执行 Gradle 构建..."
./gradlew assembleRelease
if [ $? -ne 0 ]; then
    echo "Gradle 构建失败!"
    exit 1
fi

echo "9. 复制生成的 APK..."
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    DATE=$(date +%Y%m%d)
    cp app/build/outputs/apk/release/app-release.apk "../MOO-Music-v$DATE.apk"
    echo "========================================"
    echo "🎉 APK 生成成功!"
    echo "文件位置: MOO-Music-v$DATE.apk"
    echo "========================================"
else
    echo "APK 文件未找到!"
fi

cd ..

create_gradle_files() {
    echo "正在创建 Gradle 构建配置..."
    
    # 创建 settings.gradle
    echo "include ':app'" > settings.gradle
    
    # 创建根目录 build.gradle
    cat > build.gradle << 'EOF'
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
EOF

    # 创建 gradle.properties
    cat > gradle.properties << 'EOF'
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m
EOF

    # 创建 app/build.gradle
    mkdir -p app
    cat > app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

    defaultConfig {
        applicationId "com.moo.music"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }

    signingConfigs {
        release {
            storeFile file('../app.keystore')
            storePassword '123456'
            keyAlias 'moo'
            keyPassword '123456'
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            signingConfig signingConfigs.release
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
}
EOF

    # 创建 AndroidManifest.xml
    mkdir -p app/src/main
    cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.moo.music">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MOO Music"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF
}