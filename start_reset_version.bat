@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Version avec reinitialisation
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Corrections apportees:
echo - Reinitialisation complete du composant
echo - Bouton de reinitialisation explicite
echo - Destruction complete de la carte existante
echo - Reinitialisation des formulaires
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez votre position sur la carte
echo 4. Definissez une distance maximale (ex: 5 km)
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Changez votre position et cliquez sur "Generer des recommandations"
echo 7. Si vous rencontrez des problemes, cliquez sur "Reinitialiser"
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
