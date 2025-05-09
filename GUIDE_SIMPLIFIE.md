# Guide d'Utilisation Simplifié

Ce guide vous explique comment utiliser le système de recommandation d'événements avec des données fictives.

## Démarrage rapide

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

## Comprendre les recommandations

Les recommandations sont personnalisées en fonction de vos préférences :

1. **Score de qualité**
   - Chaque recommandation a un score de qualité (pourcentage)
   - Plus le score est élevé, meilleure est la recommandation

2. **Distance**
   - La distance entre votre position et le lieu recommandé est affichée
   - Les lieux trop éloignés ont un score réduit

3. **Jours et heures**
   - Les recommandations privilégient vos jours et heures préférés

4. **Carte interactive**
   - La carte affiche tous les lieux recommandés
   - Cliquez sur un marqueur pour voir plus de détails
   - Cliquez sur une recommandation dans la liste pour la mettre en évidence sur la carte

## Remarques importantes

- **Mode démonstration** : Cette version utilise des données fictives générées localement, aucune API n'est nécessaire
- **Carte simplifiée** : La carte est une version simplifiée qui ne nécessite pas de connexion à Google Maps
- **Préférences utilisateur** : Vos préférences sont prises en compte pour générer des recommandations personnalisées

## Fonctionnalités

- **Génération de recommandations** : Le système génère des recommandations basées sur vos préférences
- **Visualisation sur carte** : Les recommandations sont affichées sur une carte interactive
- **Filtrage par préférences** : Les recommandations sont filtrées en fonction de vos jours et heures préférés
- **Calcul de distance** : La distance entre votre position et les lieux recommandés est calculée
- **Interface intuitive** : L'interface est conçue pour être simple et intuitive
