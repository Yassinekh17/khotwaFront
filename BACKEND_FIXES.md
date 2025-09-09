# Corrections Nécessaires pour le Backend

## Problème Identifié

Le controller `InscriptionController` a une erreur dans l'endpoint POST qui empêche les inscriptions de fonctionner.

## Code Actuel (Problématique)

```java
@PostMapping("/create/{eventId}/")
public ResponseEntity<?> createInscription(
        @PathVariable int eventId,
        @RequestBody Inscription inscriptionData) {

    Inscription savedInscription = inscriptionService.createInscription(userId, eventId, inscriptionData);
    // ❌ userId n'est pas défini !
```

## Solution 1: Ajouter userId dans l'URL (Recommandée)

```java
@PostMapping("/create/{eventId}/{userId}")
public ResponseEntity<?> createInscription(
        @PathVariable int eventId,
        @PathVariable int userId,
        @RequestBody Inscription inscriptionData) {

    try {
        Inscription savedInscription = inscriptionService.createInscription(userId, eventId, inscriptionData);

        if (savedInscription != null) {
            return ResponseEntity.ok(savedInscription);
        }
        return ResponseEntity.badRequest().body("L'événement a atteint sa capacité maximale");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Erreur lors de l'inscription: " + e.getMessage());
    }
}
```

## Solution 2: Supprimer userId (Si pas nécessaire)

```java
@PostMapping("/create/{eventId}")
public ResponseEntity<?> createInscription(
        @PathVariable int eventId,
        @RequestBody Inscription inscriptionData) {

    try {
        // Utiliser un userId par défaut ou depuis la session
        int userId = 1; // À remplacer par l'utilisateur connecté

        Inscription savedInscription = inscriptionService.createInscription(userId, eventId, inscriptionData);

        if (savedInscription != null) {
            return ResponseEntity.ok(savedInscription);
        }
        return ResponseEntity.badRequest().body("L'événement a atteint sa capacité maximale");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Erreur lors de l'inscription: " + e.getMessage());
    }
}
```

## Test de l'Endpoint Corrigé

Après avoir appliqué la correction :

```bash
# Test avec Solution 1
curl -X POST http://localhost:8089/inscriptions/create/1/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "telephone": "12345678"
  }'

# Test avec Solution 2
curl -X POST http://localhost:8089/inscriptions/create/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "telephone": "12345678"
  }'
```

## Vérification en Base de Données

Après un test réussi, vérifiez que les données sont bien sauvegardées :

```sql
SELECT * FROM inscription WHERE event_id = 1;
```

Vous devriez voir un enregistrement avec :
- nom: "Test User"
- email: "test@example.com"
- telephone: "12345678"
- event_id: 1
- date_inscription: [date actuelle]

## Résultat Attendu

Une fois la correction appliquée :

1. ✅ **Clic sur "S'inscrire"** → Formulaire s'affiche
2. ✅ **Remplir le formulaire** → Données collectées
3. ✅ **Soumission** → Requête POST envoyée au backend
4. ✅ **Backend** → Sauvegarde en base de données
5. ✅ **Succès** → Message de confirmation
6. ✅ **"Mes Événements"** → Événement affiché (depuis localStorage)

## Alternative Temporaire

Si vous ne voulez pas modifier le backend immédiatement, le système fonctionne avec localStorage uniquement. Les inscriptions seront sauvegardées localement et affichées dans "Mes Événements", mais ne seront pas persistées en base de données.