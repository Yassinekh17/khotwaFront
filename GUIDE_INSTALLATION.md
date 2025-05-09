# Guide d'Installation et de Résolution des Problèmes

Ce guide vous aidera à installer et exécuter le système d'optimisation des créneaux horaires et de localisation, même si vous rencontrez des problèmes avec les dépendances Python.

## Prérequis

- Python 3.6+ (idéalement Python 3.8+)
- Node.js 14+ avec npm
- Angular CLI 16+

## Installation Étape par Étape

### 1. Configuration de l'environnement Python

Si vous rencontrez des problèmes avec les dépendances Python (erreurs setuptools, etc.), exécutez le script de configuration :

```
setup_python_env.bat
```

Ce script va :
- Mettre à jour pip
- Installer/mettre à jour setuptools et wheel
- Installer les dépendances Python nécessaires directement

### 2. Démarrage de l'API Flask

Vous pouvez démarrer l'API Flask seule avec :

```
start_ml_api.bat
```

Ce script utilise une version simplifiée de l'API (`simple_app.py`) qui nécessite moins de dépendances.

### 3. Démarrage de l'Application Angular

Pour installer les dépendances Angular et démarrer l'application :

```
cd <répertoire_du_projet>
npm install --legacy-peer-deps
ng serve --open
```

### 4. Démarrage Complet du Projet

Pour démarrer à la fois l'API Flask et l'application Angular :

```
start_project.bat
```

## Résolution des Problèmes Courants

### Problèmes avec setuptools

Si vous voyez une erreur comme `Cannot import 'setuptools.build_meta'` :

1. Exécutez `setup_python_env.bat` pour installer setuptools correctement
2. Utilisez `simple_app.py` qui a moins de dépendances

### L'API Flask ne démarre pas

Si l'API Flask ne démarre pas :

1. Vérifiez que Python est correctement installé : `python --version`
2. Essayez d'installer les dépendances manuellement :
   ```
   python -m pip install flask flask-cors
   ```
3. Vérifiez qu'aucun autre service n'utilise le port 8089

### L'application Angular ne démarre pas

Si l'application Angular ne démarre pas :

1. Vérifiez que Node.js est correctement installé : `node --version`
2. Vérifiez que Angular CLI est installé : `ng --version`
3. Essayez de réinstaller les dépendances :
   ```
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

### La carte Google Maps ne s'affiche pas

Si la carte ne s'affiche pas :

1. Vérifiez la console du navigateur pour les erreurs
2. Assurez-vous que la clé API Google Maps dans `index.html` est valide
3. Vérifiez que l'API Google Maps est accessible depuis votre réseau

## Utilisation Manuelle de l'API

Si vous préférez tester l'API directement, voici les endpoints disponibles :

- `POST http://localhost:8089/api/predict` - Prédit la catégorie d'un événement
  ```json
  { "title": "Workshop Python" }
  ```

- `POST http://localhost:8089/api/recommend` - Recommande des dates et lieux
  ```json
  { "num_recommendations": 3 }
  ```

- `GET http://localhost:8089/api/locations` - Liste tous les lieux disponibles

## Contacter le Support

Si vous rencontrez toujours des problèmes, veuillez contacter le support technique en fournissant :

1. La version de Python : `python --version`
2. La version de Node.js : `node --version`
3. La version d'Angular CLI : `ng --version`
4. Les messages d'erreur exacts que vous rencontrez
