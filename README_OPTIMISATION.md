# Système d'Optimisation des Créneaux Horaires et Localisation

Ce projet implémente un système d'optimisation des créneaux horaires et de localisation pour maximiser la participation aux événements. Il utilise des algorithmes de machine learning (clustering K-Means) pour analyser les données historiques et recommander les meilleures dates et lieux.

## Fonctionnalités

- **Clustering K-Means** pour regrouper les événements similaires
- **Système de scoring géographique** pour recommander des lieux optimaux
- **Interface utilisateur moderne et intuitive** avec visualisation sur carte
- **API REST** pour l'intégration avec d'autres systèmes

## Prérequis

- Python 3.8+ avec pip
- Node.js 14+ avec npm
- Angular CLI 16+

## Installation et démarrage

### Méthode simple (recommandée)

1. Exécutez le script `start_project.bat` qui va :
   - Installer les dépendances Python
   - Démarrer l'API Flask en arrière-plan
   - Installer les dépendances Angular
   - Démarrer l'application Angular

```
start_project.bat
```

### Méthode manuelle

1. Installez les dépendances Python et démarrez l'API Flask :
```
cd ml-api
pip install -r requirements.txt
python app.py
```

2. Dans un autre terminal, installez les dépendances Angular et démarrez l'application :
```
npm install --legacy-peer-deps
ng serve --open
```

## Utilisation

1. Accédez à l'application Angular à l'adresse `http://localhost:4200`
2. Naviguez vers la page "Recommandations IA" via le menu de navigation
3. Définissez le nombre de recommandations souhaitées
4. Cliquez sur "Générer des recommandations"
5. Explorez les recommandations et la carte interactive

## Structure du projet

- `ml-api/` : API Flask pour le modèle de machine learning
  - `app.py` : Application Flask principale
  - `requirements.txt` : Dépendances Python
  - `models/` : Dossier pour les modèles entraînés

- `src/` : Application Angular
  - `app/services/predict.service.ts` : Service pour communiquer avec l'API
  - `app/views/event/recommendation/` : Composant de recommandation

## Fonctionnement technique

### Modèle de machine learning

Le système utilise l'algorithme K-Means pour regrouper les événements similaires en fonction de :
- L'heure de l'événement
- Le jour de la semaine
- Le nombre de participants
- La localisation géographique

### Système de scoring des lieux

Le système de scoring des lieux prend en compte :
- La capacité du lieu
- La popularité historique (nombre moyen de participants)
- La densité d'utilisateurs à proximité

## Dépannage

### L'API Flask ne démarre pas

- Vérifiez que Python 3.8+ est installé
- Vérifiez que les dépendances sont correctement installées
- Vérifiez qu'aucun autre service n'utilise le port 8089

### L'application Angular ne démarre pas

- Vérifiez que Node.js 14+ est installé
- Vérifiez que Angular CLI est installé
- Vérifiez qu'aucun autre service n'utilise le port 4200

### La carte ne s'affiche pas

- Vérifiez que l'API Google Maps est correctement chargée
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que la clé API Google Maps est valide

## Licence

Ce projet est sous licence MIT.
