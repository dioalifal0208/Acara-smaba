@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\deploy.ps1" %*
exit /b %ERRORLEVEL%
