@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Distance maximale augmentee
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Distance maximale augmentee a 500 km pour couvrir toute la Tunisie
echo - Valeur par defaut de 100 km pour voir plus d'evenements
echo - Filtrage des evenements en fonction de la distance maximale
echo - Message d'erreur ameliore lorsqu'aucun evenement n'est trouve dans la zone
echo - Suggestions pour aider l'utilisateur a trouver des evenements
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Definissez une distance maximale tres faible (ex: 10 km)
echo 4. Selectionnez votre position sur la carte
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Observez le message d'erreur si aucun evenement n'est trouve
echo 7. Augmentez la distance maximale et regenerez des recommandations
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
