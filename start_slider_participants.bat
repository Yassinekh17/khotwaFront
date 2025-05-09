@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Version avec slider de participants
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Interface plus moderne et creative
echo - Suppression de la section "Intelligence Artificielle au service de vos evenements"
echo - Ajout d'un slider pour le nombre maximum de participants
echo - Sliders interactifs avec affichage des valeurs en temps reel
echo - Limitation des recommandations en fonction du nombre max de participants
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Utilisez le slider pour definir le nombre maximum de participants
echo 4. Selectionnez votre position sur la carte
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Verifiez que les recommandations respectent le nombre max de participants
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
