# Endpoints Backend pour les Inscriptions

## Vue d'ensemble
Pour que les inscriptions fonctionnent correctement et soient sauvegardées dans la table `inscription` de la base de données, vous devez implémenter ces endpoints dans votre backend Spring Boot.

## Entité Inscription
```java
@Entity
@Getter
@Setter
@ToString
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int inscriptionId;

    private String nom;
    private String email;
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Evenement evenement;

    private Date dateInscription = new Date();
}
```

## Endpoints Requis

### 1. Créer une Inscription
**Endpoint:** `POST /inscriptions/create/{eventId}/{userId}`

**Request Body:**
```json
{
  "nom": "John Doe",
  "email": "john@example.com",
  "telephone": "12345678",
  "user": { "id": 1 },
  "evenement": { "eventId": 1 }
}
```

**Response:**
```json
{
  "inscriptionId": 1,
  "nom": "John Doe",
  "email": "john@example.com",
  "telephone": "12345678",
  "dateInscription": "2025-09-08T22:12:53.965+00:00",
  "user": { "id": 1 },
  "evenement": { "eventId": 1 }
}
```

**Implémentation Spring Boot:**
```java
@RestController
@RequestMapping("/inscriptions")
public class InscriptionController {

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private UserService userService;

    @Autowired
    private EvenementService evenementService;

    @PostMapping("/create/{eventId}/{userId}")
    public ResponseEntity<?> createInscription(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @RequestBody InscriptionRequest request) {

        try {
            // Vérifier que l'utilisateur existe
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body("Utilisateur non trouvé");
            }

            // Vérifier que l'événement existe
            Evenement evenement = evenementService.findById(eventId);
            if (evenement == null) {
                return ResponseEntity.badRequest()
                    .body("Événement non trouvé");
            }

            // Vérifier la capacité de l'événement
            if (evenement.getCurrentParticipants() >= evenement.getCapacite()) {
                return ResponseEntity.badRequest()
                    .body("L'événement a atteint sa capacité maximale");
            }

            // Créer l'inscription
            Inscription inscription = new Inscription();
            inscription.setNom(request.getNom());
            inscription.setEmail(request.getEmail());
            inscription.setTelephone(request.getTelephone());
            inscription.setUser(user);
            inscription.setEvenement(evenement);
            inscription.setDateInscription(new Date());

            Inscription savedInscription = inscriptionService.save(inscription);

            // Mettre à jour le nombre de participants
            evenement.setCurrentParticipants(evenement.getCurrentParticipants() + 1);
            evenementService.save(evenement);

            return ResponseEntity.ok(savedInscription);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Erreur lors de la création de l'inscription: " + e.getMessage());
        }
    }
}
```

### 2. Récupérer les Inscriptions d'un Utilisateur
**Endpoint:** `GET /inscriptions/user/{userId}`

**Response:**
```json
[
  {
    "inscriptionId": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "telephone": "12345678",
    "dateInscription": "2025-09-08T22:12:53.965+00:00",
    "evenement": {
      "eventId": 1,
      "title": "Conférence Angular",
      "description": "Description...",
      "date": "2025-09-15T10:00:00.000+00:00",
      "location": "Tunis",
      "type": "CONFERENCE",
      "status": "UPCOMING",
      "capacite": 50,
      "currentParticipants": 1
    }
  }
]
```

**Implémentation:**
```java
@GetMapping("/user/{userId}")
public ResponseEntity<?> getUserInscriptions(@PathVariable Long userId) {
    try {
        List<Inscription> inscriptions = inscriptionService.findByUserId(userId);
        return ResponseEntity.ok(inscriptions);
    } catch (Exception e) {
        return ResponseEntity.badRequest()
            .body("Erreur lors de la récupération des inscriptions: " + e.getMessage());
    }
}
```

## DTO pour les Requêtes

```java
public class InscriptionRequest {
    private String nom;
    private String email;
    private String telephone;

    // Getters and setters
}
```

## Services Nécessaires

### InscriptionService
```java
@Service
public class InscriptionService {

    @Autowired
    private InscriptionRepository inscriptionRepository;

    public Inscription save(Inscription inscription) {
        return inscriptionRepository.save(inscription);
    }

    public List<Inscription> findByUserId(Long userId) {
        return inscriptionRepository.findByUserId(userId);
    }
}
```

### InscriptionRepository
```java
@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByUserId(Long userId);

    List<Inscription> findByEvenementEventId(Long eventId);
}
```

## Test des Endpoints

### 1. Tester la Création d'Inscription
```bash
curl -X POST http://localhost:8089/inscriptions/create/1/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "telephone": "12345678",
    "user": {"id": 1},
    "evenement": {"eventId": 1}
  }'
```

### 2. Tester la Récupération des Inscriptions
```bash
curl -X GET http://localhost:8089/inscriptions/user/1
```

## Résultat Attendu

Une fois ces endpoints implémentés :

1. ✅ **Clic sur "S'inscrire"** → Formulaire s'affiche
2. ✅ **Remplir le formulaire** → Données collectées
3. ✅ **Validation** → Données envoyées au backend
4. ✅ **Backend** → Sauvegarde dans table `inscription`
5. ✅ **Succès** → Message de confirmation
6. ✅ **"Mes Événements"** → Événement inscrit s'affiche

## Debugging

Si ça ne fonctionne pas, vérifiez :

1. **Backend démarré** sur le port 8089
2. **Utilisateur ID 1** existe dans la base
3. **Événement ID 1** existe dans la base
4. **Capacité** de l'événement n'est pas atteinte
5. **Logs du backend** pour les erreurs
6. **Console du navigateur** pour les erreurs frontend