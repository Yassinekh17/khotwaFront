@echo off
echo ===================================================
echo Demarrage du systeme de recommandation corrige
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Corrections apportees:
echo - Support de 5 recommandations minimum
echo - Prise en compte correcte de la position utilisateur
echo - Verification de l'unicite des recommandations
echo - Logs detailles pour faciliter le debogage
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez votre position sur la carte
echo 4. Cliquez sur "Generer des recommandations"
echo 5. Verifiez que vous avez bien 5 recommandations differentes
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
