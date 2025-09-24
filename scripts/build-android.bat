@echo off
setlocal enabledelayedexpansion

echo ========================================
echo        MOO Music Android Build
echo ========================================

:: Check environment variables
if not defined JAVA_HOME (
    echo ERROR: JAVA_HOME environment variable not set
    echo Please install JDK and set environment variable
    echo Or run: npm run setup:android
    pause
    exit /b 1
)

echo Found JAVA_HOME: %JAVA_HOME%

echo 1. Cleaning old build files...
if exist "dist\build\app" rmdir /s /q "dist\build\app"
if exist "android-temp" rmdir /s /q "android-temp"

echo 2. Building uni-app project for H5...
call npm run build:h5
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo 3. Checking build output...
if not exist "dist\build\h5" (
    echo Build output directory not found!
    pause
    exit /b 1
)

echo 4. Creating temporary Android project directory...
mkdir "android-temp" 2>nul
mkdir "android-temp\app" 2>nul
mkdir "android-temp\app\src" 2>nul
mkdir "android-temp\app\src\main" 2>nul
mkdir "android-temp\app\src\main\assets" 2>nul
mkdir "android-temp\app\src\main\assets\www" 2>nul

echo 5. Copying uni-app build output...
xcopy "dist\build\h5\*" "android-temp\app\src\main\assets\www\" /E /Y /Q

echo 6. Copying Android project files...
xcopy "android\*" "android-temp\" /E /Y /Q

echo 6.1. Copying AndroidManifest.xml...
copy "android\app\src\main\AndroidManifest.xml" "android-temp\app\src\main\AndroidManifest.xml" >nul

echo 6.2. Copying resource files from original Android project...
xcopy "android\app\src\main\res\*" "android-temp\app\src\main\res\" /E /Y /Q


if not exist "android-temp\gradle\wrapper" mkdir "android-temp\gradle\wrapper"
copy "android\gradle\wrapper\*" "android-temp\gradle\wrapper\" >nul

echo 7. Entering temporary project directory...
cd android-temp

echo 8. Generating signing key if not exists...
if not exist "keystore" mkdir "keystore"
if not exist "keystore\moo-music.keystore" (
    echo Generating signing key...
    "%JAVA_HOME%\bin\keytool" -genkey -v -keystore keystore\moo-music.keystore -alias moo-music -keyalg RSA -keysize 2048 -validity 10000 -storepass moo123456 -keypass moo123456 -dname "CN=MOO Music, OU=Dev, O=MOO, L=Beijing, S=Beijing, C=CN"
    if errorlevel 1 (
        echo Key generation failed!
        cd ..
        pause
        exit /b 1
    )
)

echo 9. Running Gradle build...
call gradlew.bat app:assembleRelease
if errorlevel 1 (
    echo Gradle build failed!
    echo Please check if Android SDK is properly installed
    cd ..
    pause
    exit /b 1
)

echo 10. Copying generated APK...
if exist "app\build\outputs\apk\release\app-release.apk" (
    copy "app\build\outputs\apk\release\app-release.apk" "..\moo-music-v1.7.0.apk" >nul
    echo ========================================
    echo APK generated successfully!
    echo File location: moo-music-v1.7.0.apk
    echo File size: 
    for %%A in ("..\moo-music-v1.7.0.apk") do echo %%~zA bytes
    echo ========================================
) else (
    echo APK file not found!
    echo Please check build logs
)

cd ..
echo 11. Cleaning temporary files...
rmdir /s /q "android-temp"

echo Build completed!
pause
exit /b 0