# Guide d'Utilisation des Cartes

Ce guide vous explique comment utiliser le système de recommandation d'événements avec les différentes options de cartes.

## Modes de carte disponibles

Le système propose deux modes de carte :

1. **Google Maps interactif**
   - Carte interactive complète avec toutes les fonctionnalités de Google Maps
   - Marqueurs cliquables avec fenêtres d'information
   - Possibilité de zoomer, se déplacer, changer de vue

2. **Carte statique**
   - Version simplifiée qui s'affiche automatiquement si Google Maps n'est pas disponible
   - Image statique avec marqueurs numérotés
   - Mise à jour de l'image lors de la sélection d'une recommandation

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

## Utilisation de Google Maps interactif

Si Google Maps est disponible, vous verrez une carte interactive :

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

## Utilisation de la carte statique

Si Google Maps n'est pas disponible, vous verrez une carte statique :

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec la liste**
   - Cliquez sur une recommandation dans la liste pour la mettre en évidence sur la carte
   - L'image de la carte sera mise à jour pour se centrer sur le lieu sélectionné
   - Le marqueur correspondant sera affiché en rouge

3. **Message d'information**
   - Un message en bas de la carte indique que vous utilisez le mode carte statique
   - Ce mode est automatiquement activé si Google Maps n'est pas disponible

## Résolution des problèmes

Si vous rencontrez des problèmes avec les cartes :

1. **Google Maps affiche une erreur**
   - Le système basculera automatiquement vers la carte statique
   - Vous pourrez toujours voir les lieux recommandés sur la carte

2. **La carte statique ne s'affiche pas**
   - Vérifiez votre connexion Internet
   - Rafraîchissez la page
   - Générez à nouveau des recommandations

3. **Les marqueurs ne s'affichent pas correctement**
   - Vérifiez que les recommandations ont bien des coordonnées
   - Rafraîchissez la page
