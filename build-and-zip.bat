@echo off
echo Running Next.js build...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed! Exiting.
    pause
    exit /b 1
)

echo Build successful.
echo Starting zip...
cd out
powershell.exe -ExecutionPolicy Bypass -Command "Compress-Archive -Path '.\*' -DestinationPath '..\build.zip' -Force"
cd ..

echo Zip complete.
pause