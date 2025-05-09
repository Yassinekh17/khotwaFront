# Guide d'Utilisation du Système de Recommandation Professionnel

Ce guide vous explique comment utiliser le système de recommandation d'événements avec ses nouvelles fonctionnalités professionnelles.

## Nouvelles fonctionnalités

Le système a été amélioré avec :

1. **Sélection de position sur la carte**
   - Marquez votre position directement sur la carte interactive
   - Plus besoin d'entrer manuellement les coordonnées
   - Possibilité de déplacer le marqueur pour ajuster la position

2. **Système de prédiction avancé**
   - Algorithme de scoring sophistiqué prenant en compte de multiples facteurs
   - Calcul réaliste du nombre de participants attendus
   - Recommandations personnalisées basées sur vos préférences

3. **Lieux réels en Tunisie**
   - Utilisation de lieux culturels réels en Tunisie
   - Coordonnées géographiques précises pour chaque lieu
   - Informations détaillées sur chaque lieu (type, capacité, etc.)

4. **Types d'événements adaptés**
   - Événements adaptés à chaque type de lieu
   - Conférences, concerts, expositions, festivals, séminaires, ateliers, etc.
   - Titres d'événements générés automatiquement

5. **OpenStreetMap intégré**
   - Carte interactive intégrée directement dans l'interface
   - Marqueurs personnalisés pour chaque lieu
   - Navigation fluide et intuitive

## Démarrage de l'application

1. **Démarrer l'application avec le nouveau script**
   ```
   .\start_professional_app.bat
   ```
   Ce script va démarrer l'application Angular et ouvrir votre navigateur à l'adresse http://localhost:4200

2. **Accéder aux recommandations**
   - Cliquez sur "Recommandations IA" dans la barre de navigation

## Utilisation des préférences utilisateur

Le système vous permet de personnaliser vos recommandations en fonction de vos préférences :

1. **Ouvrir le formulaire de préférences**
   - Cliquez sur "Personnaliser mes préférences" pour afficher le formulaire

2. **Sélectionner votre position sur la carte**
   - Une carte interactive s'affiche dans le formulaire
   - Cliquez sur la carte pour marquer votre position
   - Vous pouvez aussi déplacer le marqueur en le faisant glisser
   - Les coordonnées sont automatiquement mises à jour dans le formulaire

3. **Définir la distance maximale**
   - Indiquez la distance maximale (en km) que vous êtes prêt à parcourir
   - Cette distance est utilisée pour filtrer et scorer les recommandations

4. **Sélectionner vos jours préférés**
   - Cliquez sur les jours de la semaine qui vous conviennent le mieux
   - Les recommandations privilégieront ces jours

5. **Sélectionner vos heures préférées**
   - Cliquez sur les heures qui vous conviennent le mieux
   - Les recommandations privilégieront ces heures

6. **Générer les recommandations**
   - Cliquez sur "Générer des recommandations"
   - Le système utilisera vos préférences pour vous proposer les meilleures options

## Comprendre le système de scoring

Le nouveau système de scoring prend en compte plusieurs facteurs pour évaluer chaque lieu :

1. **Popularité du lieu**
   - Basée sur la capacité du lieu
   - Les lieux plus grands ont généralement un meilleur score de base

2. **Adéquation du type d'événement**
   - Certains types d'événements sont mieux adaptés à certains lieux
   - Par exemple, un concert dans un théâtre aura un meilleur score qu'un séminaire

3. **Jour de la semaine**
   - Les événements le week-end ont généralement un meilleur score
   - Les jours que vous avez sélectionnés comme préférés ont un bonus

4. **Heure de la journée**
   - Les heures de pointe (soirée) ont un meilleur score
   - Les heures que vous avez sélectionnées comme préférées ont un bonus

5. **Distance**
   - Les lieux proches de votre position ont un meilleur score
   - Les lieux très proches (moins d'un tiers de votre distance maximale) reçoivent un bonus
   - Les lieux au-delà de votre distance maximale sont fortement pénalisés

## Interprétation des scores

Les scores sont présentés sous forme de pourcentage et sont classés comme suit :

- **90-95%** : Excellent - Recommandation idéale
- **80-89%** : Très bon - Recommandation fortement conseillée
- **70-79%** : Bon - Recommandation conseillée
- **60-69%** : Correct - Recommandation acceptable
- **50-59%** : Moyen - Recommandation à considérer
- **< 50%** : Faible - Recommandation peu conseillée

## Utilisation de la carte des recommandations

La carte des recommandations vous permet de visualiser les lieux recommandés :

1. **Visualisation des marqueurs**
   - Chaque lieu recommandé est représenté par un marqueur numéroté sur la carte
   - Les marqueurs correspondent aux numéros dans la liste des recommandations

2. **Interaction avec les marqueurs**
   - Cliquez sur un marqueur pour voir plus de détails
   - Un popup s'affiche avec toutes les informations sur l'événement

3. **Sélection d'une recommandation**
   - Cliquez sur une recommandation dans la liste pour la voir sur la carte
   - La carte se centre automatiquement sur le lieu sélectionné
   - Le popup correspondant s'ouvre automatiquement

## Conseils d'utilisation

1. **Soyez précis avec votre position**
   - Plus votre position est précise, plus les recommandations seront pertinentes
   - Utilisez la carte pour marquer votre position exacte

2. **Ajustez la distance maximale**
   - Une distance trop courte limitera les options
   - Une distance trop longue inclura des lieux peu pratiques
   - La distance optimale dépend de votre moyen de transport

3. **Sélectionnez plusieurs jours et heures**
   - Plus vous sélectionnez d'options, plus vous aurez de recommandations variées
   - Sélectionnez au moins 2-3 jours et 3-4 heures pour de meilleurs résultats
