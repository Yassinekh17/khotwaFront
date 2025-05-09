# Guide d'Utilisation avec Google Maps

Ce guide vous explique comment utiliser le système de recommandation d'événements avec Google Maps.

## Prérequis

1. **Connexion Internet**
   - Une connexion Internet active est nécessaire pour charger Google Maps

2. **Navigateur compatible**
   - Chrome, Firefox, Edge ou Safari récent

3. **Pas de bloqueur de publicités pour Google Maps**
   - Certains bloqueurs de publicités peuvent bloquer Google Maps

## Test de Google Maps

Avant d'utiliser l'application, vérifiez que Google Maps fonctionne correctement sur votre navigateur :

1. **Exécuter le test**
   ```
   .\test_google_maps.bat
   ```
   Ce script va ouvrir une page HTML qui teste si Google Maps fonctionne correctement.

2. **Vérifier le résultat**
   - Si une carte s'affiche, Google Maps fonctionne correctement
   - Si une erreur s'affiche, suivez les instructions pour résoudre le problème

## Démarrage de l'application

1. **Démarrer l'application Angular**
   ```
   .\start_angular.bat
   ```
   Ce script va démarrer l'application Angular et ouvrir votre navigateur à l'adresse http://localhost:4200

2. **Accéder aux recommandations**
   - Cliquez sur "Recommandations IA" dans la barre de navigation

## Utilisation des préférences utilisateur

Le système vous permet de personnaliser vos recommandations en fonction de vos préférences :

1. **Ouvrir le formulaire de préférences**
   - Cliquez sur "Personnaliser mes préférences" pour afficher le formulaire

2. **Saisir votre localisation**
   - Entrez votre latitude et longitude
   - Par défaut, les coordonnées du centre de Tunis (36.8070, 10.1825) sont utilisées

3. **Définir la distance maximale**
   - Indiquez la distance maximale (en km) que vous êtes prêt à parcourir

4. **Sélectionner vos jours préférés**
   - Cliquez sur les jours de la semaine qui vous conviennent le mieux

5. **Sélectionner vos heures préférées**
   - Cliquez sur les heures qui vous conviennent le mieux

6. **Générer les recommandations**
   - Cliquez sur "Générer des recommandations"
   - Le système utilisera vos préférences pour vous proposer les meilleures options

## Utilisation de la carte Google Maps

La carte Google Maps affiche les lieux recommandés :

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec les marqueurs**
   - Cliquez sur un marqueur pour voir plus de détails
   - Le marqueur sélectionné devient rouge et affiche une fenêtre d'information
   - La recommandation correspondante est mise en évidence dans la liste

3. **Interaction avec la liste**
   - Cliquez sur une recommandation dans la liste pour la mettre en évidence sur la carte
   - Le marqueur correspondant devient rouge et affiche une fenêtre d'information
   - La carte se centre automatiquement sur le marqueur sélectionné

## Résolution des problèmes

Si vous rencontrez des problèmes avec Google Maps :

1. **La carte ne s'affiche pas**
   - Vérifiez votre connexion Internet
   - Désactivez temporairement votre bloqueur de publicités
   - Exécutez `.\test_google_maps.bat` pour tester Google Maps

2. **Les marqueurs ne s'affichent pas**
   - Rafraîchissez la page
   - Générez à nouveau des recommandations

3. **La carte est grise ou vide**
   - Vérifiez que la clé API Google Maps est valide
   - Essayez un autre navigateur
