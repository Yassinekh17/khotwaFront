@echo off
echo ===================================================
echo Demarrage complet du systeme de recommandation
echo ===================================================

echo.
echo 1. Arret des processus Python existants...
taskkill /F /IM python.exe 2>nul
echo Tous les processus Python ont ete arretes.

echo.
echo 2. Demarrage de l'API Flask en arriere-plan...
start cmd /k "cd ml-api && python simple_app.py"

echo.
echo 3. Attente du demarrage de l'API (5 secondes)...
timeout /t 5 /nobreak > nul

echo.
echo 4. Demarrage de l'application Angular...
echo.
echo L'API Flask est accessible a l'adresse: http://localhost:8090 (ou 5000)
echo L'application Angular sera accessible a l'adresse: http://localhost:4200
echo.
echo Pour utiliser le systeme de recommandation:
echo 1. Accedez a http://localhost:4200
echo 2. Cliquez sur "Recommandations IA" dans la barre de navigation
echo 3. Entrez le nombre de recommandations souhaite (1-10)
echo 4. Cliquez sur "Generer des recommandations"
echo.
echo Appuyez sur Ctrl+C pour arreter l'application Angular.
echo.
ng serve --open
