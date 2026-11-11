@echo off
setlocal
cd /d "%~dp0"
title Meu Espaco
set "PY="
py -3 -V >nul 2>&1
if not errorlevel 1 set "PY=py -3"
if not defined PY (
  python -V >nul 2>&1
  if not errorlevel 1 set "PY=python"
)
if not defined PY (
  python3 -V >nul 2>&1
  if not errorlevel 1 set "PY=python3"
)
if not defined PY (
  echo.
  echo Nao encontrei o Python neste computador.
  echo Instale em https://www.python.org/downloads/ marcando "Add python.exe to PATH",
  echo ou abra o index.html direto ^(sem captura automatica^).
  echo.
  pause
  exit /b 1
)
echo Abrindo o Meu Espaco em http://localhost:8000 ...
%PY% servidor.py
if errorlevel 1 (
  echo.
  echo O servidor parou. Veja a mensagem acima.
  pause
)
