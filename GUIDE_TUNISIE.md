# Guide d'Utilisation avec Lieux Réels en Tunisie

Ce guide vous explique comment utiliser le système de recommandation d'événements avec des lieux réels en Tunisie et Google Maps intégré.

## Nouvelles fonctionnalités

Le système a été amélioré avec :

1. **Lieux réels en Tunisie**
   - Utilisation de lieux culturels réels en Tunisie (théâtres, musées, centres culturels, etc.)
   - Coordonnées géographiques précises pour chaque lieu
   - Informations détaillées sur chaque lieu (type, capacité, etc.)

2. **Types d'événements réels**
   - Événements adaptés à chaque type de lieu
   - Conférences, concerts, expositions, festivals, séminaires, ateliers, etc.
   - Titres d'événements générés automatiquement

3. **Google Maps intégré**
   - Carte Google Maps intégrée directement dans l'interface
   - Marqueurs interactifs pour chaque lieu recommandé
   - Possibilité d'ouvrir Google Maps réel pour chaque lieu

4. **Calcul de distance réel**
   - Calcul précis de la distance entre votre position et chaque lieu
   - Prise en compte de la distance dans le score de recommandation
   - Filtrage des lieux en fonction de la distance maximale

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

3. **Redirection vers Google Maps réel**
   - Cliquez sur le bouton "Ouvrir dans Google Maps" dans la fenêtre d'information
   - Cliquez sur le bouton "Ouvrir dans Google Maps" dans la liste des recommandations
   - Une nouvelle fenêtre s'ouvrira avec Google Maps réel centré sur le lieu sélectionné

4. **Utilisation de Google Maps réel**
   - Obtenez des itinéraires vers le lieu sélectionné
   - Explorez les environs du lieu sélectionné
   - Utilisez toutes les fonctionnalités de Google Maps (Street View, partage, etc.)

## Exemples de lieux disponibles

Le système inclut maintenant des lieux réels en Tunisie, tels que :

1. **Théâtre Municipal de Tunis**
   - Théâtre historique au cœur de Tunis
   - Capacité : 350 personnes

2. **Cité de la Culture**
   - Plus grand complexe culturel de Tunisie
   - Capacité : 1800 personnes

3. **Acropolium de Carthage**
   - Ancienne cathédrale Saint-Louis de Carthage
   - Capacité : 300 personnes

4. **Amphithéâtre de Carthage**
   - Amphithéâtre romain restauré
   - Capacité : 5000 personnes

5. **Musée du Bardo**
   - L'un des plus importants musées du bassin méditerranéen
   - Capacité : 500 personnes

Et bien d'autres lieux culturels importants en Tunisie.
