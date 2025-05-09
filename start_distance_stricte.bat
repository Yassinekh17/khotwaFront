@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Distance stricte et plus d'evenements
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Respect strict de la distance maximale definie par l'utilisateur
echo - Multiplication des evenements (3 evenements par lieu avec des dates differentes)
echo - Variation des dates et heures pour plus de choix
echo - Message d'erreur ameliore avec plus de suggestions
echo - Melange aleatoire des evenements pour plus de variete
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Definissez un nombre precis de recommandations (ex: 10)
echo 3. Cliquez sur "Personnaliser mes preferences"
echo 4. Definissez une distance maximale (ex: 50 km)
echo 5. Selectionnez votre position sur la carte
echo 6. Cliquez sur "Generer des recommandations"
echo 7. Verifiez que tous les evenements sont dans la zone definie
echo 8. Essayez avec une distance plus petite pour voir le message d'erreur
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
