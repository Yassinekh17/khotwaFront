@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - VERSION D'URGENCE
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Corrections d'urgence apportees:
echo - Simplification complete de la generation des recommandations
echo - Respect strict du nombre de recommandations demande
echo - Coherence garantie des recommandations
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Entrez un nombre precis de recommandations (1-10)
echo 3. Cliquez sur "Personnaliser mes preferences"
echo 4. Selectionnez votre position sur la carte
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Verifiez que le nombre d'evenements affiches correspond exactement au nombre demande
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
