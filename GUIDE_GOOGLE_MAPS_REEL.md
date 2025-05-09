# Guide d'Utilisation avec Google Maps Réel

Ce guide vous explique comment utiliser le système de recommandation d'événements avec Google Maps en temps réel.

## Fonctionnalités principales

Le système propose maintenant une intégration complète avec Google Maps :

1. **Affichage des événements sur Google Maps**
   - Tous les événements recommandés sont affichés sur la carte Google Maps
   - Chaque événement est représenté par un marqueur numéroté
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Redirection vers Google Maps réel**
   - Cliquez sur un marqueur pour voir les détails de l'événement
   - Cliquez sur le bouton "Ouvrir dans Google Maps" pour ouvrir l'application Google Maps réelle
   - Vous pouvez également cliquer sur le bouton "Ouvrir dans Google Maps" dans la liste des recommandations

3. **Fonctionnalités de Google Maps**
   - Utilisez toutes les fonctionnalités de Google Maps (zoom, déplacement, vue satellite, etc.)
   - Obtenez des itinéraires vers les lieux recommandés
   - Explorez les environs des lieux recommandés

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

## Utilisation de Google Maps

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec les marqueurs**
   - Cliquez sur un marqueur pour voir plus de détails
   - Le marqueur sélectionné devient rouge et affiche une fenêtre d'information
   - La fenêtre d'information contient un bouton "Ouvrir dans Google Maps"

3. **Redirection vers Google Maps réel**
   - Cliquez sur le bouton "Ouvrir dans Google Maps" dans la fenêtre d'information
   - Cliquez sur le bouton "Ouvrir dans Google Maps" dans la liste des recommandations
   - Une nouvelle fenêtre s'ouvrira avec Google Maps réel centré sur le lieu sélectionné

4. **Utilisation de Google Maps réel**
   - Obtenez des itinéraires vers le lieu sélectionné
   - Explorez les environs du lieu sélectionné
   - Utilisez toutes les fonctionnalités de Google Maps (Street View, partage, etc.)

## Avantages de cette intégration

1. **Navigation facilitée**
   - Obtenez facilement des itinéraires vers les lieux recommandés
   - Utilisez la navigation GPS de Google Maps pour vous rendre aux événements

2. **Informations complètes**
   - Accédez à toutes les informations disponibles sur Google Maps (avis, photos, etc.)
   - Explorez les environs des lieux recommandés (restaurants, parkings, etc.)

3. **Partage simplifié**
   - Partagez facilement les lieux recommandés avec d'autres personnes
   - Envoyez les coordonnées directement depuis Google Maps

## Résolution des problèmes

Si vous rencontrez des problèmes avec Google Maps :

1. **Google Maps ne s'affiche pas**
   - Le système basculera automatiquement vers la carte statique
   - Vous pourrez toujours ouvrir Google Maps réel en cliquant sur le bouton "Ouvrir dans Google Maps"

2. **Les liens vers Google Maps ne fonctionnent pas**
   - Vérifiez votre connexion Internet
   - Essayez un autre navigateur
   - Vérifiez que vous avez une application Google Maps installée sur votre appareil
