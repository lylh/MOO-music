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
if exist "dist\build" rmdir /s /q "dist\build"
if exist "android-temp" rmdir /s /q "android-temp"

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

@REM echo 2. Building uni-app project for H5...
@REM call npm run build:h5
@REM if errorlevel 1 (
@REM     echo Build failed!
@REM     pause
@REM     exit /b 1
@REM )

@REM echo 3. Checking build output...
@REM if not exist "dist\build\h5" (
@REM     echo Build output directory not found!
@REM     pause
@REM     exit /b 1
@REM )

echo 4. Creating temporary Android project directory...
mkdir "android-temp" 2>nul
mkdir "android-temp" 2>nul
mkdir "android-temp\src" 2>nul
mkdir "android-temp\src\main" 2>nul
mkdir "android-temp\src\main\assets" 2>nul
mkdir "android-temp\src\main\assets\www" 2>nul

@REM echo 5. Copying uni-app build output...
@REM xcopy "dist\build\h5\*" "android-temp\src\main\assets\www\" /E /Y /Q

echo 6. Copying Android project files...
echo 6.1. Creating app directory structure...
if not exist "android-temp\app" mkdir "android-temp\app"
if not exist "android-temp\app\src" mkdir "android-temp\app\src"
if not exist "android-temp\app\src\main" mkdir "android-temp\app\src\main"

echo 6.2. Copying build.gradle and other config files...
copy "Moomusic\build.gradle" "android-temp\app\build.gradle" >nul
copy "Moomusic\proguard-rules.pro" "android-temp\app\proguard-rules.pro" >nul
if exist "Moomusic\local.properties" copy "Moomusic\local.properties" "android-temp\app\local.properties" >nul

echo 6.3. Copying AndroidManifest.xml...
copy "Moomusic\src\main\AndroidManifest.xml" "android-temp\app\src\main\AndroidManifest.xml" >nul
if exist "android-temp\app\src\main\AndroidManifest.xml" (
    echo AndroidManifest.xml copied successfully
) else (
    echo ERROR: Failed to copy AndroidManifest.xml
)

echo 6.4. Copying Java source files...
if exist "Moomusic\src\main\java" (
    if not exist "android-temp\app\src\main\java" mkdir "android-temp\app\src\main\java"
    xcopy "Moomusic\src\main\java\*" "android-temp\app\src\main\java\" /E /Y /Q
    echo Java source files copied
) else (
    echo Warning: Java source directory not found, skipping...
)

echo 6.5. Copying assets...
if exist "Moomusic\src\main\assets" (
    if not exist "android-temp\app\src\main\assets" mkdir "android-temp\app\src\main\assets"
    xcopy "Moomusic\src\main\assets\*" "android-temp\app\src\main\assets\" /E /Y /Q
    echo Assets copied
) else (
    echo Warning: Assets directory not found, skipping...
)

echo 6.6. Copying resource files...
if exist "Moomusic\src\main\res" (
    if not exist "android-temp\app\src\main\res" mkdir "android-temp\app\src\main\res"
    xcopy "Moomusic\src\main\res\*" "android-temp\app\src\main\res\" /E /Y /Q
    echo Resource files copied
) else (
    echo Warning: Resource directory not found, skipping...
)

echo 6.7. Copying libs directory...
if exist "Moomusic\libs" (
    if not exist "android-temp\app\libs" mkdir "android-temp\app\libs"
    xcopy "Moomusic\libs\*" "android-temp\app\libs\" /E /Y /Q
    echo Libs copied
) else (
    echo Warning: Libs directory not found, skipping...
)

echo 6.8. Copying keystore files...
if exist "Moomusic\test.jks" (
    copy "Moomusic\test.jks" "android-temp\app\test.jks" >nul
    echo Keystore file copied
) else (
    echo Warning: Keystore file not found, skipping...
)

echo 6.9. Creating colors.xml with required color definitions...
if not exist "android-temp\app\src\main\res\values\" mkdir "android-temp\app\src\main\res\values\"
echo ^<?xml version="1.0" encoding="utf-8"?^> > "android-temp\app\src\main\res\values\colors.xml"
echo ^<resources^> >> "android-temp\app\src\main\res\values\colors.xml"
echo     ^<color name="ime_background"^>#cccccc^</color^> >> "android-temp\app\src\main\res\values\colors.xml"
echo ^</resources^> >> "android-temp\app\src\main\res\values\colors.xml"

echo 6.10. Copying Gradle wrapper files...
if not exist "android-temp\gradle\wrapper" mkdir "android-temp\gradle\wrapper"
copy "gradle\wrapper\*" "android-temp\gradle\wrapper\" >nul

echo 6.11. Copying gradlew files...
copy "gradlew" "android-temp\gradlew" >nul
copy "gradlew.bat" "android-temp\gradlew.bat" >nul

echo 6.12. Creating settings.gradle for android-temp...
echo rootProject.name = 'HBuilderIntegrateAS' > "android-temp\settings.gradle"
echo include ':app' >> "android-temp\settings.gradle"

echo 6.13. Copying root build.gradle to android-temp...
copy "build.gradle" "android-temp\build.gradle" >nul

echo 6.14. Copying gradle.properties to android-temp...
copy "gradle.properties" "android-temp\gradle.properties" >nul

echo 7. Entering temporary project directory...
cd android-temp

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
    echo Expected location: app\build\outputs\apk\release\app-release.apk
)

cd ..
echo 11. Cleaning temporary files...
rmdir /s /q "android-temp"

echo Build completed!
pause
exit /b 0