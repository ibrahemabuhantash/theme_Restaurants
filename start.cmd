@echo off
setlocal
cd /d "%~dp0"
set "MANARA_NPM=npm.cmd"
if exist "%~dp0.tools\node-v22.22.3-win-x64\npm.cmd" (
  set "PATH=%~dp0.tools\node-v22.22.3-win-x64;%PATH%"
  set "MANARA_NPM=%~dp0.tools\node-v22.22.3-win-x64\npm.cmd"
)
call "%MANARA_NPM%" --version >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 LTS, then run this file again.
  exit /b 1
)
if not exist "node_modules\@angular\cli\bin\ng.js" (
  call "%MANARA_NPM%" ci
  if errorlevel 1 exit /b 1
)
call "%MANARA_NPM%" start
