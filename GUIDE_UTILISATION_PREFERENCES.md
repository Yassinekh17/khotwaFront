# Guide d'Utilisation du Système de Recommandation avec Préférences

Ce guide vous explique comment utiliser le système d'optimisation des créneaux horaires et de localisation avec vos préférences personnelles.

## Démarrage du système

1. **Démarrer l'API Flask**
   ```
   .\start_api_simple.bat
   ```
   Ce script va :
   - Arrêter tous les processus Python existants
   - Installer les dépendances requises
   - Démarrer l'API Flask sur le port 5000

2. **Vérifier que l'API fonctionne**
   ```
   .\test_api_simple.bat
   ```
   Ce script va :
   - Tester si l'API est accessible sur les ports 5000, 8080 ou 8090
   - Tester les endpoints de l'API

3. **Démarrer l'application Angular** (dans une autre fenêtre de commande)
   ```
   ng serve --open
   ```

2. **Accéder à l'application**
   - Ouvrez votre navigateur et accédez à http://localhost:4200
   - Cliquez sur "Recommandations IA" dans la barre de navigation

## Utilisation des préférences utilisateur

Le système vous permet maintenant de personnaliser vos recommandations en fonction de vos préférences :

1. **Ouvrir le formulaire de préférences**
   - Cliquez sur "Personnaliser mes préférences" pour afficher le formulaire

2. **Saisir votre localisation**
   - Entrez votre latitude et longitude
   - Par défaut, les coordonnées du centre de Tunis (36.8070, 10.1825) sont utilisées

3. **Définir la distance maximale**
   - Indiquez la distance maximale (en km) que vous êtes prêt à parcourir
   - Cette distance sera utilisée pour filtrer les recommandations

4. **Sélectionner vos jours préférés**
   - Cliquez sur les jours de la semaine qui vous conviennent le mieux
   - Par défaut, Mardi et Jeudi sont sélectionnés

5. **Sélectionner vos heures préférées**
   - Cliquez sur les heures qui vous conviennent le mieux
   - Par défaut, 10h, 14h et 18h sont sélectionnées

6. **Générer les recommandations**
   - Cliquez sur "Générer des recommandations"
   - Le système utilisera vos préférences pour vous proposer les meilleures options

## Comprendre les recommandations

Les recommandations sont maintenant personnalisées en fonction de vos préférences :

1. **Score de qualité**
   - Chaque recommandation a un score de qualité (pourcentage)
   - Plus le score est élevé, meilleure est la recommandation

2. **Distance**
   - La distance entre votre position et le lieu recommandé est affichée
   - Les lieux trop éloignés ont un score réduit

3. **Jours et heures**
   - Les recommandations privilégient vos jours et heures préférés
   - Si vous n'avez pas spécifié de préférences, des valeurs par défaut sont utilisées

4. **Carte interactive**
   - La carte affiche tous les lieux recommandés
   - Cliquez sur un marqueur pour voir plus de détails
   - Cliquez sur une recommandation dans la liste pour la mettre en évidence sur la carte

## Exemple d'utilisation

1. Vous habitez près du centre-ville (36.8070, 10.1825)
2. Vous préférez les événements en semaine (Mardi, Jeudi)
3. Vous êtes disponible le matin (10h) et en fin d'après-midi (18h)
4. Vous ne voulez pas vous déplacer à plus de 5 km

Le système va :
- Filtrer les lieux situés à plus de 5 km
- Privilégier les événements le Mardi et le Jeudi
- Privilégier les événements à 10h et 18h
- Vous recommander les meilleures combinaisons de date et lieu

## Résolution des problèmes

Si vous rencontrez des problèmes :

1. **L'API n'est pas accessible**
   - Exécutez `.\start_api_simple.bat` pour redémarrer l'API
   - Vérifiez que vous voyez le message "API Flask démarrée sur http://localhost:8090"

2. **Les préférences ne sont pas prises en compte**
   - Vérifiez que vous avez bien cliqué sur les boutons pour sélectionner vos préférences
   - Les boutons sélectionnés apparaissent en bleu

3. **La carte ne s'affiche pas**
   - Vérifiez que vous êtes connecté à Internet
   - Rafraîchissez la page

Pour plus d'informations, consultez le guide de dépannage `DEPANNAGE.md`.
