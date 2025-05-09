@echo off
echo ===================================================
echo Demarrage de l'API Flask simplifiee
echo ===================================================

echo.
echo Verification des processus existants...
powershell -Command "Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*simple_app.py*' } | ForEach-Object { Write-Host ('Arret du processus ' + $_.Id); Stop-Process -Id $_.Id -Force }"

echo.
echo Demarrage de l'API Flask...
cd ml-api

echo.
echo L'API va essayer de demarrer sur le port 8090.
echo Si ce port est deja utilise, elle essaiera le port 5000.
echo.
echo Appuyez sur Ctrl+C pour arreter l'API.
echo.
python simple_app.py

echo.
echo Si vous rencontrez des erreurs, executez d'abord .\setup_python_env.bat
