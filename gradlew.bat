@if "%DEBUG%" == "" @echo off
@rem Forwarding script for root Gradle wrapper in Ionic / Capacitor
set DIR=%~dp0
if exist "%DIR%android\gradlew.bat" (
    cd /d "%DIR%android"
    call gradlew.bat %*
) else (
    echo Error: android\gradlew.bat not found.
    exit /b 1
)
