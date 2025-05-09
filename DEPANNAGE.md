# Guide de Dépannage

Ce guide vous aidera à résoudre les problèmes courants rencontrés lors de l'utilisation du système de recommandation.

## Problème 1: L'API n'est pas accessible

Si vous voyez le message "L'API n'est pas accessible", suivez ces étapes :

1. **Vérifiez que l'API Flask est en cours d'exécution**
   - Exécutez `.\kill_api.bat` pour arrêter tous les processus Python existants
   - Exécutez `.\start_ml_api.bat` pour démarrer l'API Flask
   - Vérifiez que vous voyez le message "API Flask démarrée sur http://localhost:8090" (ou un autre port)

2. **Vérifiez que l'API est accessible dans votre navigateur**
   - Ouvrez http://localhost:8090 dans votre navigateur
   - Vous devriez voir une page de documentation de l'API
   - Si vous ne voyez pas cette page, essayez avec les ports 8089 et 5000

3. **Vérifiez les pare-feu et antivirus**
   - Désactivez temporairement votre pare-feu et antivirus pour voir si cela résout le problème
   - Si oui, ajoutez des exceptions pour Python et les ports 8090, 8089 et 5000

4. **Utilisez le script de démarrage complet**
   - Exécutez `.\start_all.bat` qui démarre à la fois l'API Flask et l'application Angular

## Problème 2: Google Maps ne s'affiche pas

Si la carte Google Maps ne s'affiche pas, suivez ces étapes :

1. **Vérifiez la console du navigateur**
   - Ouvrez les outils de développement de votre navigateur (F12)
   - Vérifiez s'il y a des erreurs liées à Google Maps
   - Vérifiez si vous voyez le message "Google Maps API chargée avec succès"

2. **Vérifiez votre connexion Internet**
   - Google Maps nécessite une connexion Internet active
   - Vérifiez que vous pouvez accéder à d'autres sites web

3. **Vérifiez la clé API Google Maps**
   - La clé API Google Maps peut être restreinte à certains domaines
   - Essayez de remplacer la clé API dans `src/index.html` par une nouvelle clé

4. **Essayez un autre navigateur**
   - Certains navigateurs peuvent bloquer Google Maps
   - Essayez Chrome, Firefox ou Edge

## Problème 3: Aucune recommandation n'apparaît

Si vous ne voyez aucune recommandation après avoir cliqué sur le bouton, suivez ces étapes :

1. **Vérifiez que l'API renvoie des données**
   - Exécutez `.\test_api.bat` pour tester l'API
   - Vérifiez que l'API renvoie des recommandations

2. **Vérifiez les données de test**
   - Assurez-vous que le fichier `ml-api/test_data.json` existe et contient des données valides
   - Redémarrez l'API Flask après avoir modifié ce fichier

3. **Vérifiez la console du navigateur**
   - Ouvrez les outils de développement de votre navigateur (F12)
   - Vérifiez s'il y a des erreurs lors de la récupération des recommandations

## Solution de dernier recours

Si rien ne fonctionne, essayez cette solution de dernier recours :

1. Arrêtez tous les processus en cours d'exécution
   ```
   .\kill_api.bat
   ```

2. Supprimez les fichiers temporaires
   ```
   rmdir /s /q ml-api\models
   ```

3. Redémarrez complètement le système
   ```
   .\start_all.bat
   ```

Si le problème persiste, veuillez contacter le support technique en fournissant :
- Les messages d'erreur exacts
- Les étapes que vous avez suivies
- Les captures d'écran des erreurs
