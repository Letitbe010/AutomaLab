@echo off
rem AutomaLab: starts the development server and opens the app in the browser.
rem Double-click this file. Close this window to stop AutomaLab.
title AutomaLab
cd /d "%~dp0"
where npm >nul 2>nul || set "PATH=%PATH%;C:\Program Files\nodejs"

rem Already running? Then only open the browser.
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo AutomaLab martxan dago jada. Nabigatzailea irekitzen...
  start "" http://localhost:5173
  timeout /t 3 >nul
  exit /b
)

echo.
echo   AutomaLab abiarazten... Nabigatzailea bere kabuz irekiko da:
echo   http://localhost:5173
echo.
echo   Leiho hau irekita utzi aplikazioa erabiltzen duzun bitartean.
echo   Ixteko: itxi leiho hau (edo Ctrl+C).
echo.
call npm run dev -- --open
pause
