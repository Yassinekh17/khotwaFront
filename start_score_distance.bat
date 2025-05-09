@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Score base sur la distance
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Score base principalement sur la distance par rapport a l'utilisateur
echo - Tri des recommandations par distance (les plus proches en premier)
echo - Calcul plus precis de la distance avec la formule de Haversine
echo - Ajustement des seuils pour les evaluations (Excellent, Bon, etc.)
echo - Bonus de score pour les lieux tres proches
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez votre position sur la carte
echo 4. Cliquez sur "Generer des recommandations"
echo 5. Verifiez que les lieux les plus proches ont les meilleurs scores
echo 6. Changez votre position et regenerez des recommandations
echo 7. Verifiez que les scores ont change en fonction de la nouvelle position
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
