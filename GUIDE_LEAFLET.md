# Guide d'Utilisation avec OpenStreetMap (Leaflet)

Ce guide vous explique comment utiliser le système de recommandation d'événements avec OpenStreetMap (Leaflet) intégré directement dans l'interface.

## Nouvelles fonctionnalités

Le système a été amélioré avec :

1. **OpenStreetMap (Leaflet) intégré**
   - Carte interactive intégrée directement dans l'interface
   - Fonctionne sans clé API (contrairement à Google Maps)
   - Solution robuste qui ne nécessite pas d'authentification

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
   .\start_leaflet_maps.bat
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

## Utilisation d'OpenStreetMap (Leaflet)

La carte OpenStreetMap est maintenant intégrée directement dans l'interface :

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec les marqueurs**
   - Cliquez sur un marqueur pour voir plus de détails
   - Un popup s'affiche avec toutes les informations sur l'événement
   - Le popup contient le titre, le lieu, la date, le type d'événement, etc.

3. **Navigation sur la carte**
   - Utilisez la molette de la souris pour zoomer/dézoomer
   - Cliquez et faites glisser pour vous déplacer sur la carte
   - Double-cliquez pour zoomer sur un point précis

4. **Sélection d'une recommandation**
   - Cliquez sur une recommandation dans la liste pour la voir sur la carte
   - La carte se centre automatiquement sur le lieu sélectionné
   - Le popup correspondant s'ouvre automatiquement

## Avantages d'OpenStreetMap (Leaflet)

1. **Fiabilité**
   - Fonctionne sans clé API (contrairement à Google Maps)
   - Ne nécessite pas d'authentification
   - Pas de limitations d'utilisation

2. **Performance**
   - Chargement rapide de la carte
   - Consommation de ressources réduite
   - Fluidité de l'interface

3. **Personnalisation**
   - Marqueurs personnalisés avec numéros
   - Popups informatifs avec toutes les données nécessaires
   - Interface adaptée à l'application

4. **Open Source**
   - Utilisation de technologies open source
   - Données cartographiques libres et collaboratives
   - Contribution à la communauté OpenStreetMap
