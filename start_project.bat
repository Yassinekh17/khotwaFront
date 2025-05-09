@echo off
echo ===================================================
echo Demarrage du projet d'optimisation des evenements
echo ===================================================

echo.
echo IMPORTANT : Lisez attentivement ces instructions
echo ---------------------------------------------
echo 1. Ce script va demarrer l'API Flask et l'application Angular
echo 2. Pour utiliser le systeme de recommandation :
echo    - Accedez a http://localhost:4200
echo    - Cliquez sur "Recommandations IA" dans la barre de navigation
echo    - Entrez le nombre de recommandations souhaite (1-10)
echo    - Cliquez sur "Generer des recommandations"
echo 3. Consultez GUIDE_UTILISATION.md pour plus de details
echo.
echo Appuyez sur une touche pour continuer...
pause > nul

echo.
echo 1. Demarrage de l'API Flask simplifiee en arriere-plan...
cd ml-api
start /b python simple_app.py
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors du demarrage de l'API Flask.
    echo Essayez d'executer .\setup_python_env.bat d'abord.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Retour au repertoire principal...
cd ..

echo.
echo 4. Installation des dependances Angular...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'installation des dependances Angular.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 5. Demarrage de l'application Angular...
echo.
echo L'API Flask est accessible a l'adresse: http://localhost:8089
echo L'application Angular sera accessible a l'adresse: http://localhost:4200
echo.
echo Appuyez sur Ctrl+C pour arreter l'application Angular.
echo.
call ng serve --open
