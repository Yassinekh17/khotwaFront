@echo off
echo ===================================================
echo Demarrage de l'API Flask Minimale
echo ===================================================

echo.
echo 1. Arret des processus Python existants...
taskkill /F /IM python.exe 2>nul
echo Tous les processus Python ont ete arretes.

echo.
echo 2. Installation des dependances minimales...
pip install flask flask-cors

echo.
echo 3. Demarrage de l'API Flask minimale...
echo.
echo IMPORTANT: L'API va demarrer sur le port 5000.
echo Vous pourrez y acceder a l'adresse http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter l'API.
echo.
cd ml-api
python minimal_app.py
