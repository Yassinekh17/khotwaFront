@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Evenements a Tunis
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Concentration des evenements a Tunis pour un choix plus large
echo - 12 lieux par categorie (60 lieux au total)
echo - 5 evenements par lieu (300 evenements au total)
echo - Position par defaut centree sur Tunis
echo - Distance maximale reduite a 15 km par defaut
echo - Respect strict de la distance maximale definie par l'utilisateur
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Definissez un nombre precis de recommandations (ex: 10)
echo 3. Cliquez sur "Personnaliser mes preferences"
echo 4. Selectionnez une categorie d'evenement
echo 5. Definissez une distance maximale (ex: 10 km)
echo 6. Selectionnez votre position sur la carte
echo 7. Cliquez sur "Generer des recommandations"
echo 8. Explorez la variete des evenements proposes a Tunis
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
