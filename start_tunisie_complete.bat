@echo off
echo ===================================================
echo Demarrage du systeme de recommandation - Tunisie complete
echo ===================================================

echo.
echo Demarrage de l'application Angular...
echo.
echo L'application sera accessible a l'adresse http://localhost:4200
echo.
echo Ameliorations apportees:
echo - Evenements dans toute la Tunisie (Tunis, Sousse, Nabeul, Hammamet, Sfax, etc.)
echo - Affichage de la ville dans les recommandations
echo - Position par defaut plus centrale en Tunisie
echo - Distance maximale augmentee a 50 km par defaut
echo - Score base sur la distance par rapport a l'utilisateur
echo - Calcul precis de la distance avec la formule de Haversine
echo.
echo Pour tester:
echo 1. Cliquez sur "Recommandations IA"
echo 2. Cliquez sur "Personnaliser mes preferences"
echo 3. Selectionnez votre position sur la carte (au centre de la Tunisie)
echo 4. Selectionnez une categorie d'evenement
echo 5. Cliquez sur "Generer des recommandations"
echo 6. Observez les evenements dans differentes villes de Tunisie
echo 7. Notez que les lieux les plus proches ont les meilleurs scores
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.
ng serve --open
