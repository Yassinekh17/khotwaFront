# Guide d'Utilisation du Système de Recommandation

Ce guide vous explique comment utiliser le système d'optimisation des créneaux horaires et de localisation pour maximiser la participation à vos événements.

## Prérequis

Avant d'utiliser le système, assurez-vous que :

1. L'API Flask est en cours d'exécution (vous devriez voir un message "API Flask démarrée sur http://localhost:8090" dans la console)
2. L'application Angular est en cours d'exécution (accessible à l'adresse http://localhost:4200)

## Vérification de l'API

Pour vérifier que l'API fonctionne correctement :

1. Ouvrez votre navigateur et accédez à http://localhost:8090 (ou http://localhost:5000 si le port 8090 est déjà utilisé)
2. Vous devriez voir une page de documentation de l'API avec les endpoints disponibles
3. Vous pouvez également exécuter le script `test_api.bat` pour tester automatiquement tous les endpoints

## Résolution des problèmes d'accès au port

Si vous rencontrez des problèmes d'accès au port lors du démarrage de l'API :

1. Exécutez `kill_api.bat` pour arrêter tous les processus Python en cours d'exécution
2. Redémarrez l'API avec `start_ml_api.bat`

L'API essaiera automatiquement d'utiliser le port 8090, puis le port 5000 si nécessaire.

## Accéder au Système de Recommandation

1. Ouvrez votre navigateur et accédez à http://localhost:4200
2. Cliquez sur "Recommandations IA" dans la barre de navigation en haut de la page

## Utiliser le Système de Recommandation

### Étape 1 : Configurer les Recommandations

1. Sur la page de recommandation, vous verrez un formulaire avec un champ "Nombre de recommandations"
2. Entrez le nombre de recommandations que vous souhaitez obtenir (entre 1 et 10)
3. Cliquez sur le bouton "Générer des recommandations"

![Formulaire de recommandation](images/form.png)

### Étape 2 : Explorer les Recommandations

Une fois les recommandations générées, vous verrez deux sections principales :

1. **Carte Interactive** (à gauche) :
   - Affiche les lieux recommandés avec des marqueurs numérotés
   - Cliquez sur un marqueur pour voir plus de détails sur le lieu
   - La carte s'ajuste automatiquement pour inclure tous les lieux recommandés

2. **Liste des Recommandations** (à droite) :
   - Affiche les détails de chaque recommandation
   - Chaque recommandation inclut :
     - Nom du lieu
     - Date et heure recommandées
     - Score de qualité (pourcentage)
     - Nombre de participants attendus
     - Capacité du lieu
   - Cliquez sur une recommandation pour la mettre en évidence sur la carte

![Recommandations](images/recommendations.png)

### Étape 3 : Interpréter les Recommandations

Chaque recommandation est évaluée selon plusieurs critères :

- **Score** : Indique la qualité globale de la recommandation (plus le pourcentage est élevé, meilleure est la recommandation)
- **Participants attendus** : Estimation du nombre de participants basée sur les données historiques
- **Capacité** : Nombre maximum de personnes que le lieu peut accueillir

Les recommandations sont classées par ordre de pertinence, la meilleure apparaissant en premier.

## Résolution des Problèmes Courants

### La carte ne s'affiche pas

Si la carte Google Maps ne s'affiche pas :

1. Vérifiez que vous êtes connecté à Internet
2. Ouvrez la console du navigateur (F12) pour voir les erreurs éventuelles
3. Rafraîchissez la page

### Erreur "L'API n'est pas accessible"

Si vous voyez cette erreur :

1. Vérifiez que l'API Flask est en cours d'exécution
2. Exécutez `.\start_ml_api.bat` si nécessaire
3. Vérifiez qu'aucun pare-feu ne bloque l'accès au port 8089

### Aucune recommandation n'apparaît

Si vous ne voyez aucune recommandation après avoir cliqué sur le bouton :

1. Vérifiez la console du navigateur pour les erreurs
2. Assurez-vous que l'API Flask fonctionne correctement
3. Essayez de réduire le nombre de recommandations demandées

## Fonctionnement Technique

Le système utilise :

1. **Clustering K-Means** pour regrouper les événements similaires
2. **Système de scoring géographique** pour évaluer les lieux
3. **Analyse temporelle** pour identifier les meilleurs créneaux horaires

Ces algorithmes analysent les données historiques pour recommander les meilleures combinaisons de dates et lieux qui maximiseront la participation à vos événements.
