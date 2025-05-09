@echo off
echo ===================================================
echo Arret des processus Python en cours d'execution
echo ===================================================

echo.
echo Recherche des processus Python...
powershell -Command "Get-Process -Name python -ErrorAction SilentlyContinue | ForEach-Object { Write-Host ('Arret du processus ' + $_.Id); Stop-Process -Id $_.Id -Force }"

echo.
echo Si aucun message d'erreur n'est apparu, tous les processus Python ont ete arretes.

echo.
echo Verification des ports utilises...
powershell -Command "foreach ($port in @(8090, 8089, 5000)) { try { $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop; if ($conn) { Write-Host ('Port ' + $port + ' utilise par le processus ' + $conn[0].OwningProcess); Stop-Process -Id $conn[0].OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('Processus arrete.') } } catch { Write-Host ('Port ' + $port + ' libre ou commande non disponible.') } }"

echo.
echo ===================================================
echo Tous les processus ont ete arretes.
echo Vous pouvez maintenant redemarrer l'API avec .\start_ml_api.bat
echo ===================================================
echo.
pause
