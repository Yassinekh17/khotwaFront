@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Version finale
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Corrections apportees:
echo - Reinitialisation correcte de la carte lors de nouvelles recommandations
echo - Filtrage strict par distance maximale
echo - Logs detailles pour faciliter le debogage
echo - Verification de l'unicite des recommandations
echo - Support de 5 recommandations minimum
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez votre position sur la carte
echo 4. Definissez une distance maximale (ex: 5 km)
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Verifiez que les recommandations respectent la distance maximale
echo 7. Changez votre position et regenerez des recommandations
echo 8. Verifiez que les recommandations sont mises a jour sur la carte
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
