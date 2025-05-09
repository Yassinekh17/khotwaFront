@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Nombre exact d'evenements
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Garantie du nombre exact d'evenements demande
echo - Recherche elargie automatique si necessaire
echo - Message d'avertissement lorsque la recherche est elargie
echo - Tri des evenements par distance (les plus proches en premier)
echo - Nombre maximum de recommandations augmente a 20
echo - Lieux dans toute la Tunisie (50 lieux au total)
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Definissez un nombre precis de recommandations (ex: 5)
echo 3. Cliquez sur "Personnaliser mes preferences"
echo 4. Definissez une distance maximale tres faible (ex: 10 km)
echo 5. Selectionnez votre position sur la carte
echo 6. Cliquez sur "Generer des recommandations"
echo 7. Verifiez que vous obtenez exactement le nombre demande
echo 8. Notez le message d'avertissement si la recherche a ete elargie
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
