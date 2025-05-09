# Guide d'Utilisation avec Solution Google Maps Robuste

Ce guide vous explique comment utiliser le système de recommandation d'événements avec la nouvelle solution Google Maps robuste.

## Nouvelles fonctionnalités

Le système a été amélioré avec :

1. **Solution Google Maps robuste**
   - Intégration directe de Google Maps dans l'interface
   - Gestion d'erreur améliorée pour éviter les problèmes de chargement
   - Solution de secours en cas d'échec de Google Maps

2. **Lieux réels en Tunisie**
   - Utilisation de lieux culturels réels en Tunisie (théâtres, musées, centres culturels, etc.)
   - Coordonnées géographiques précises pour chaque lieu
   - Informations détaillées sur chaque lieu (type, capacité, etc.)

3. **Types d'événements réels**
   - Événements adaptés à chaque type de lieu
   - Conférences, concerts, expositions, festivals, séminaires, ateliers, etc.
   - Titres d'événements générés automatiquement

4. **Calcul de distance réel**
   - Calcul précis de la distance entre votre position et chaque lieu
   - Prise en compte de la distance dans le score de recommandation
   - Filtrage des lieux en fonction de la distance maximale

## Démarrage de l'application

1. **Démarrer l'application avec le nouveau script**
   ```
   .\start_maps_solution.bat
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
   - Ces coordonnées sont utilisées pour calculer la distance vers chaque lieu

3. **Définir la distance maximale**
   - Indiquez la distance maximale (en km) que vous êtes prêt à parcourir
   - Les lieux situés au-delà de cette distance auront un score réduit

4. **Sélectionner vos jours préférés**
   - Cliquez sur les jours de la semaine qui vous conviennent le mieux
   - Les recommandations privilégieront ces jours

5. **Sélectionner vos heures préférées**
   - Cliquez sur les heures qui vous conviennent le mieux
   - Les recommandations privilégieront ces heures

6. **Générer les recommandations**
   - Cliquez sur "Générer des recommandations"
   - Le système utilisera vos préférences pour vous proposer les meilleures options

## Comprendre les recommandations

Les recommandations sont maintenant plus détaillées :

1. **Titre de l'événement**
   - Chaque recommandation a un titre qui combine le type d'événement et le lieu
   - Par exemple : "Concert - Théâtre Municipal de Tunis"

2. **Lieu**
   - Le nom du lieu réel en Tunisie
   - Par exemple : "Théâtre Municipal de Tunis", "Cité de la Culture", etc.

3. **Type d'événement**
   - Le type d'événement adapté au lieu
   - Par exemple : "Concert", "Exposition", "Conférence", etc.

4. **Date et heure**
   - La date et l'heure recommandées pour l'événement
   - Basées sur vos préférences de jours et d'heures

5. **Distance**
   - La distance entre votre position et le lieu (en km)
   - Calculée précisément avec la formule de Haversine

6. **Score de qualité**
   - Chaque recommandation a un score de qualité (pourcentage)
   - Ce score prend en compte la capacité du lieu, la distance, etc.

## Utilisation de Google Maps

La carte Google Maps est maintenant intégrée directement dans l'interface :

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec les marqueurs**
   - Cliquez sur un marqueur pour voir plus de détails
   - Le marqueur sélectionné devient rouge et affiche une fenêtre d'information
   - La fenêtre d'information contient toutes les informations sur l'événement

3. **Solution de secours**
   - Si Google Maps ne se charge pas correctement, une solution de secours s'affiche
   - Cette solution affiche une liste des lieux recommandés
   - Un bouton "Réessayer" permet de tenter de recharger Google Maps

## Résolution des problèmes

Si vous rencontrez des problèmes avec Google Maps :

1. **Message d'erreur Google Maps**
   - Un message d'erreur s'affiche en bas à droite de l'écran
   - Ce message indique que Google Maps n'a pas pu être chargé correctement

2. **Solution de secours**
   - Une carte de secours s'affiche avec une liste des lieux recommandés
   - Un bouton "Réessayer" permet de tenter de recharger Google Maps

3. **Rafraîchir la page**
   - Si la carte ne s'affiche toujours pas, essayez de rafraîchir la page
   - Cela peut résoudre les problèmes temporaires de chargement

4. **Vérifier la console**
   - Ouvrez la console du navigateur (F12)
   - Vérifiez s'il y a des erreurs liées à Google Maps
   - Ces erreurs peuvent vous aider à comprendre le problème
