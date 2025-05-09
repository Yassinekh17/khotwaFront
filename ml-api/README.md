# API de Recommandation pour Événements

Cette API Flask fournit des recommandations de dates et de lieux pour maximiser la participation aux événements.

## Fonctionnalités

- **Clustering K-Means** pour regrouper les événements similaires
- **Système de scoring géographique** pour recommander des lieux optimaux
- **API REST** pour intégration facile avec le frontend

## Endpoints

- `/api/predict` - Prédit la catégorie d'un événement (compatibilité avec l'ancien système)
- `/api/recommend` - Recommande des dates et lieux optimaux
- `/api/locations` - Renvoie tous les lieux disponibles avec leurs scores

## Installation

1. Installer les dépendances :
   ```
   pip install -r requirements.txt
   ```

2. Lancer l'API :
   ```
   python app.py
   ```

L'API sera accessible à l'adresse `http://localhost:8089`.

## Modèle de Machine Learning

Le modèle utilise l'algorithme K-Means pour regrouper les événements similaires en fonction de :
- L'heure de l'événement
- Le jour de la semaine
- Le nombre de participants
- La localisation géographique

Le système de scoring des lieux prend en compte :
- La capacité du lieu
- La popularité historique (nombre moyen de participants)
- La densité d'utilisateurs à proximité
