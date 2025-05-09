@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Categories dynamiques
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Interface plus moderne et creative
echo - Lieux specifiques pour chaque categorie d'evenements
echo - Titres d'evenements professionnels par categorie
echo - Changement dynamique des lieux en fonction de la categorie
echo - Slider pour le nombre maximum de participants
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez une categorie d'evenement dans la liste deroulante
echo 4. Selectionnez votre position sur la carte
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Verifiez que les lieux sont specifiques a la categorie choisie
echo 7. Changez de categorie et regenerez des recommandations
echo 8. Verifiez que les lieux ont bien change
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
