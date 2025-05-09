@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Plus d'evenements
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Ajout de 10 lieux par categorie (50 lieux au total)
echo - Ajout de 10 titres d'evenements par categorie (50 titres au total)
echo - Augmentation du nombre maximum de recommandations a 20
echo - Nombre de recommandations par defaut augmente a 10
echo - Lieux dans toute la Tunisie (Tunis, Sousse, Nabeul, Sfax, Monastir, etc.)
echo - Filtrage des evenements en fonction de la distance maximale
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Augmentez le nombre de recommandations (jusqu'a 20)
echo 3. Cliquez sur "Personnaliser mes preferences"
echo 4. Selectionnez une categorie d'evenement
echo 5. Definissez une distance maximale suffisante
echo 6. Cliquez sur "Generer des recommandations"
echo 7. Explorez la variete des evenements proposes
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
