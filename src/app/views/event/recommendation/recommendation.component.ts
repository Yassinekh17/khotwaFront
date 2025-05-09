import { Component, OnInit } from '@angular/core';
import { PredictService, EventRecommendation, LocationInfo, UserPreferences } from '../../../services/predict.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Déclaration des types Leaflet pour TypeScript
declare global {
  interface Window {
    mapsLoaded?: boolean;
  }
}

// Déclaration de la variable globale L (Leaflet)
declare const L: any;

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {
  recommendations: EventRecommendation[] = [];
  locations: LocationInfo[] = [];
  loading: boolean = false;
  error: string = '';
  warning: string = '';
  selectedRecommendation: EventRecommendation | null = null;
  recommendationForm: FormGroup;
  userPreferencesForm: FormGroup;
  mapInitialized: boolean = false;
  map: any;
  markers: any[] = [];

  // Jours de la semaine pour le formulaire
  weekDays = [
    { id: 0, name: 'Lundi' },
    { id: 1, name: 'Mardi' },
    { id: 2, name: 'Mercredi' },
    { id: 3, name: 'Jeudi' },
    { id: 4, name: 'Vendredi' },
    { id: 5, name: 'Samedi' },
    { id: 6, name: 'Dimanche' }
  ];

  // Heures de la journée pour le formulaire
  hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8h à 20h

  // Catégories d'événements pour le formulaire
  eventCategories = [
    { id: 'all', name: 'Toutes les catégories' },
    { id: 'Développement', name: 'Développement' },
    { id: 'Cloud', name: 'Cloud' },
    { id: 'Sécurité', name: 'Sécurité' },
    { id: 'IA', name: 'Intelligence Artificielle' },
    { id: 'Blockchain', name: 'Blockchain & Web3' }
  ];

  // Indique si le formulaire de préférences est affiché
  showPreferencesForm: boolean = false;

  constructor(
    private predictService: PredictService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Formulaire pour le nombre de recommandations
    this.recommendationForm = this.fb.group({
      numRecommendations: [5, [Validators.required, Validators.min(1), Validators.max(20)]] // Augmenté à 20 pour plus d'événements
    });

    // Formulaire pour les préférences utilisateur
    this.userPreferencesForm = this.fb.group({
      location: this.fb.group({
        lat: [36.8070, [Validators.required]], // Position centrée sur Tunis
        lng: [10.1815, [Validators.required]]  // Centre-ville de Tunis
      }),
      preferred_days: this.fb.array([]),
      preferred_times: this.fb.array([]),
      max_distance: [15, [Validators.required, Validators.min(1), Validators.max(50)]], // Distance max réduite pour Tunis
      max_participants: [500, [Validators.required, Validators.min(50), Validators.max(5000)]],
      event_category: ['all', [Validators.required]]
    });

    // Ajouter des jours par défaut (mardi, jeudi)
    this.addDayPreference(1); // Mardi
    this.addDayPreference(3); // Jeudi

    // Ajouter des heures par défaut (10h, 14h, 18h)
    this.addTimePreference(10);
    this.addTimePreference(14);
    this.addTimePreference(18);

    console.log('RecommendationComponent initialisé');
  }

  // Getters pour accéder aux FormArrays
  get preferredDays() {
    return this.userPreferencesForm.get('preferred_days') as FormArray;
  }

  get preferredTimes() {
    return this.userPreferencesForm.get('preferred_times') as FormArray;
  }

  // Méthodes pour ajouter/supprimer des préférences
  addDayPreference(dayId: number) {
    const dayExists = this.preferredDays.value.includes(dayId);
    if (!dayExists) {
      this.preferredDays.push(this.fb.control(dayId));
    }
  }

  removeDayPreference(index: number) {
    this.preferredDays.removeAt(index);
  }

  addTimePreference(hour: number) {
    const hourExists = this.preferredTimes.value.includes(hour);
    if (!hourExists) {
      this.preferredTimes.push(this.fb.control(hour));
    }
  }

  removeTimePreference(index: number) {
    this.preferredTimes.removeAt(index);
  }

  toggleDayPreference(dayId: number) {
    const index = this.preferredDays.value.indexOf(dayId);
    if (index === -1) {
      this.addDayPreference(dayId);
    } else {
      this.removeDayPreference(index);
    }
  }

  toggleTimePreference(hour: number) {
    const index = this.preferredTimes.value.indexOf(hour);
    if (index === -1) {
      this.addTimePreference(hour);
    } else {
      this.removeTimePreference(index);
    }
  }

  isDaySelected(dayId: number): boolean {
    return this.preferredDays.value.includes(dayId);
  }

  isTimeSelected(hour: number): boolean {
    return this.preferredTimes.value.includes(hour);
  }

  // Propriété pour suivre si les cartes sont disponibles
  mapsLoaded: boolean = false;

  // Propriété pour Leaflet
  leafletMap: any = null;
  leafletMarkers: any[] = [];

  // Propriété pour la carte de sélection de position
  locationPickerMap: any = null;
  locationMarker: any = null;

  ngOnInit(): void {
    // Écouter l'événement de chargement des cartes
    window.addEventListener('maps-loaded', () => {
      console.log('Événement maps-loaded reçu');
      this.mapsLoaded = true;
      if (this.recommendations.length > 0) {
        this.initLeafletMap();
      }
    });

    // Vérifier si Leaflet est déjà chargé
    if (window.mapsLoaded) {
      console.log('Leaflet déjà chargé');
      this.mapsLoaded = true;
    }

    // Obtenir les recommandations et les lieux
    this.getRecommendations();
    this.getLocations();
  }

  getRecommendations(): void {
    console.log("=== NOUVELLE DEMANDE DE RECOMMANDATIONS ===");

    // Réinitialisation complète
    this.loading = true;
    this.error = '';
    this.warning = '';
    this.mapInitialized = false;

    // Vider les recommandations précédentes
    this.recommendations = [];
    this.selectedRecommendation = null;

    // Détruire complètement la carte existante
    if (this.leafletMap) {
      console.log("Destruction de la carte existante");
      this.leafletMarkers.forEach(marker => {
        if (marker) {
          this.leafletMap.removeLayer(marker);
        }
      });
      this.leafletMarkers = [];
      this.leafletMap.remove();
      this.leafletMap = null;

      // Vider l'élément de carte
      const mapElement = document.getElementById('recommendation-map');
      if (mapElement) {
        mapElement.innerHTML = '';
      }
    }

    // Récupérer le nombre de recommandations demandé par l'utilisateur
    let numRecommendations = this.recommendationForm.get('numRecommendations')?.value || 5;

    // Vérifier que le nombre est entre 1 et 10
    numRecommendations = Math.max(1, Math.min(10, numRecommendations));

    console.log('Nombre de recommandations demandé (exact):', numRecommendations);

    // Récupérer les préférences utilisateur si le formulaire est valide
    let userPreferences: UserPreferences | undefined;

    if (this.userPreferencesForm.valid) {
      userPreferences = this.userPreferencesForm.value;

      // Vérifier que les coordonnées sont bien définies
      if (userPreferences.location &&
        (userPreferences.location.lat === null || userPreferences.location.lng === null ||
          userPreferences.location.lat === undefined || userPreferences.location.lng === undefined)) {
        // Utiliser les coordonnées par défaut
        userPreferences.location = {
          lat: 36.8070,
          lng: 10.1825
        };
      }

      console.log('Préférences utilisateur:', userPreferences);
    }

    console.log('Demande de recommandations:', numRecommendations, 'avec préférences:', userPreferences);

    // Générer des recommandations fictives si l'API n'est pas disponible
    const useMockData = true; // Mettre à true pour utiliser des données fictives

    if (useMockData) {
      // Générer des recommandations fictives
      this.generateMockRecommendations(numRecommendations, userPreferences);
    } else {
      // Essayer d'obtenir les recommandations via le service
      this.predictService.getRecommendations(numRecommendations, userPreferences).subscribe({
        next: (data) => {
          console.log('Recommandations reçues:', data);
          this.recommendations = data;
          this.loading = false;

          // Masquer le formulaire de préférences après avoir obtenu les recommandations
          this.showPreferencesForm = false;

          // Initialiser la carte après avoir obtenu les recommandations
          setTimeout(() => {
            this.initMap();
          }, 500);
        },
        error: (err) => {
          console.error('Erreur détaillée:', err);
          this.error = 'Erreur lors de la récupération des recommandations. Utilisation de données fictives.';

          // Générer des recommandations fictives en cas d'erreur
          this.generateMockRecommendations(numRecommendations, userPreferences);
        }
      });
    }
  }

  /**
   * Génère des recommandations avec des lieux réels en Tunisie
   */
  generateMockRecommendations(numRecommendations: number, userPreferences?: UserPreferences): void {
    console.log('Génération de recommandations avec des lieux réels');
    console.log('NOMBRE EXACT DEMANDÉ:', numRecommendations);

    // Lieux concentrés à Tunis et ses environs proches (Grand Tunis)
    const venuesByCategory = {
      "Développement": [
        { name: "Technopark El Ghazala", lat: 36.8922, lng: 10.1870, capacity: 300, type: "Centre technologique", city: "Tunis" },
        { name: "Centre de Formation ESPRIT", lat: 36.8985, lng: 10.1896, capacity: 200, type: "École d'ingénieurs", city: "Tunis" },
        { name: "Université de Tunis El Manar", lat: 36.8163, lng: 10.1387, capacity: 500, type: "Université", city: "Tunis" },
        { name: "Institut Supérieur d'Informatique", lat: 36.8102, lng: 10.1845, capacity: 300, type: "Institut", city: "Tunis" },
        { name: "Faculté des Sciences de Tunis", lat: 36.8173, lng: 10.1367, capacity: 400, type: "Université", city: "Tunis" },
        { name: "École Polytechnique de Tunisie", lat: 36.8731, lng: 10.3235, capacity: 350, type: "École d'ingénieurs", city: "Tunis" },
        { name: "Espace Co-working Cogite", lat: 36.8325, lng: 10.2381, capacity: 120, type: "Espace de coworking", city: "Tunis" },
        { name: "Institut National des Sciences Appliquées", lat: 36.8427, lng: 10.1957, capacity: 250, type: "Institut", city: "Tunis" },
        { name: "Centre de Formation en Informatique", lat: 36.8245, lng: 10.1956, capacity: 150, type: "Centre de formation", city: "Tunis" },
        { name: "Université de Carthage", lat: 36.8611, lng: 10.3361, capacity: 400, type: "Université", city: "Tunis" },
        { name: "Digital Center Tunis", lat: 36.8389, lng: 10.2456, capacity: 180, type: "Centre numérique", city: "Tunis" },
        { name: "Startup House Tunis", lat: 36.8512, lng: 10.2123, capacity: 100, type: "Incubateur", city: "Tunis" }
      ],
      "Cloud": [
        { name: "Palais des Congrès", lat: 36.8422, lng: 10.2039, capacity: 1500, type: "Centre de conférences", city: "Tunis" },
        { name: "Hôtel Sheraton Tunis", lat: 36.8366, lng: 10.2344, capacity: 800, type: "Hôtel", city: "Tunis" },
        { name: "Centre d'Affaires Les Berges du Lac", lat: 36.8401, lng: 10.2041, capacity: 350, type: "Centre d'affaires", city: "Tunis" },
        { name: "Novotel Tunis", lat: 36.8408, lng: 10.2025, capacity: 600, type: "Hôtel", city: "Tunis" },
        { name: "Hôtel Dar El Marsa", lat: 36.8789, lng: 10.3247, capacity: 250, type: "Hôtel", city: "Tunis" },
        { name: "Hôtel Ramada Plaza", lat: 36.9214, lng: 10.2851, capacity: 700, type: "Hôtel", city: "Tunis" },
        { name: "Regus Business Center", lat: 36.8520, lng: 10.2099, capacity: 250, type: "Centre d'affaires", city: "Tunis" },
        { name: "Golden Tulip El Mechtel", lat: 36.8066, lng: 10.1824, capacity: 450, type: "Hôtel", city: "Tunis" },
        { name: "Hôtel Laico Tunis", lat: 36.8078, lng: 10.1867, capacity: 550, type: "Hôtel", city: "Tunis" },
        { name: "Centre de Conférences Tunis Bay", lat: 36.8356, lng: 10.2427, capacity: 400, type: "Centre de conférences", city: "Tunis" },
        { name: "Hôtel Africa Tunis", lat: 36.7992, lng: 10.1843, capacity: 300, type: "Hôtel", city: "Tunis" },
        { name: "Hôtel El Mouradi Gammarth", lat: 36.9187, lng: 10.2892, capacity: 600, type: "Hôtel", city: "Tunis" }
      ],
      "Sécurité": [
        { name: "École Supérieure des Communications", lat: 36.8062, lng: 10.1893, capacity: 300, type: "École", city: "Tunis" },
        { name: "Cité de la Culture", lat: 36.8134, lng: 10.1818, capacity: 1800, type: "Centre culturel", city: "Tunis" },
        { name: "Parc des Expositions du Kram", lat: 36.8334, lng: 10.3204, capacity: 2000, type: "Centre d'exposition", city: "Tunis" },
        { name: "Centre National de l'Informatique", lat: 36.8345, lng: 10.2387, capacity: 350, type: "Centre informatique", city: "Tunis" },
        { name: "Agence Nationale de Sécurité Informatique", lat: 36.8501, lng: 10.2654, capacity: 200, type: "Agence gouvernementale", city: "Tunis" },
        { name: "Faculté des Sciences de Tunis", lat: 36.8163, lng: 10.1387, capacity: 500, type: "Université", city: "Tunis" },
        { name: "Centre de Formation en Cybersécurité", lat: 36.8245, lng: 10.1956, capacity: 150, type: "Centre de formation", city: "Tunis" },
        { name: "Ministère des Technologies de la Communication", lat: 36.8062, lng: 10.1893, capacity: 250, type: "Institution gouvernementale", city: "Tunis" },
        { name: "Salle de Conférence Hôtel du Parc", lat: 36.8134, lng: 10.1818, capacity: 200, type: "Hôtel", city: "Tunis" },
        { name: "Centre de Certification Électronique", lat: 36.8345, lng: 10.2387, capacity: 150, type: "Centre de certification", city: "Tunis" },
        { name: "Académie Militaire de Cyberdéfense", lat: 36.8501, lng: 10.2654, capacity: 180, type: "Académie", city: "Tunis" },
        { name: "Institut Supérieur de l'Informatique", lat: 36.8163, lng: 10.1387, capacity: 300, type: "Institut", city: "Tunis" }
      ],
      "IA": [
        { name: "Pôle Technologique El Ghazala", lat: 36.8931, lng: 10.1882, capacity: 450, type: "Pôle technologique", city: "Tunis" },
        { name: "Théâtre Municipal de Tunis", lat: 36.7992, lng: 10.1843, capacity: 350, type: "Théâtre", city: "Tunis" },
        { name: "Amphithéâtre de Carthage", lat: 36.8531, lng: 10.3261, capacity: 5000, type: "Amphithéâtre", city: "Tunis" },
        { name: "Centre de Recherche en Intelligence Artificielle", lat: 36.8412, lng: 10.1879, capacity: 200, type: "Centre de recherche", city: "Tunis" },
        { name: "Institut National des Sciences Appliquées", lat: 36.8427, lng: 10.1957, capacity: 400, type: "Institut", city: "Tunis" },
        { name: "Laboratoire de Recherche en IA", lat: 36.8301, lng: 10.1989, capacity: 150, type: "Laboratoire", city: "Tunis" },
        { name: "Centre d'Innovation Digitale", lat: 36.8389, lng: 10.2456, capacity: 180, type: "Centre d'innovation", city: "Tunis" },
        { name: "Université de Tunis - Département IA", lat: 36.8163, lng: 10.1387, capacity: 250, type: "Université", city: "Tunis" },
        { name: "Hôtel Concorde Les Berges du Lac", lat: 36.8401, lng: 10.2041, capacity: 500, type: "Hôtel", city: "Tunis" },
        { name: "Centre de Recherche en Informatique de Tunis", lat: 36.8427, lng: 10.1957, capacity: 200, type: "Centre de recherche", city: "Tunis" },
        { name: "Académie d'Intelligence Artificielle", lat: 36.8931, lng: 10.1882, capacity: 150, type: "Académie", city: "Tunis" },
        { name: "Espace Innovation El Ghazala", lat: 36.8922, lng: 10.1870, capacity: 300, type: "Espace d'innovation", city: "Tunis" }
      ],
      "Blockchain": [
        { name: "Musée du Bardo", lat: 36.8092, lng: 10.1344, capacity: 500, type: "Musée", city: "Tunis" },
        { name: "Acropolium de Carthage", lat: 36.8578, lng: 10.3253, capacity: 300, type: "Monument historique", city: "Tunis" },
        { name: "Centre d'Innovation Blockchain", lat: 36.8356, lng: 10.2427, capacity: 150, type: "Centre d'innovation", city: "Tunis" },
        { name: "Hôtel Mövenpick Gammarth", lat: 36.9187, lng: 10.2892, capacity: 600, type: "Hôtel", city: "Tunis" },
        { name: "Théâtre de l'Opéra de Tunis", lat: 36.8134, lng: 10.1818, capacity: 1200, type: "Opéra", city: "Tunis" },
        { name: "Dar El Jeld", lat: 36.7986, lng: 10.1708, capacity: 200, type: "Restaurant culturel", city: "Tunis" },
        { name: "Centre des Musiques Arabes et Méditerranéennes", lat: 36.8698, lng: 10.3416, capacity: 250, type: "Centre culturel", city: "Tunis" },
        { name: "El Teatro", lat: 36.8008, lng: 10.1841, capacity: 200, type: "Théâtre", city: "Tunis" },
        { name: "Blockchain Hub Tunis", lat: 36.8325, lng: 10.2381, capacity: 120, type: "Hub technologique", city: "Tunis" },
        { name: "Cité des Sciences de Tunis", lat: 36.8427, lng: 10.1957, capacity: 400, type: "Centre scientifique", city: "Tunis" },
        { name: "Palais Kheireddine", lat: 36.7986, lng: 10.1708, capacity: 300, type: "Palais", city: "Tunis" },
        { name: "Maison de la Culture Ibn Rachiq", lat: 36.8008, lng: 10.1841, capacity: 250, type: "Centre culturel", city: "Tunis" }
      ]
    };

    // Types d'événements réels
    const eventTypes = [
      "Conférence", "Workshop", "Hackathon", "Webinaire", "Formation",
      "Challenge", "Meetup", "Séminaire", "Débat", "Certification"
    ];

    // Titres d'événements professionnels par catégorie
    const professionalEventTitles = {
      "Développement": [
        "Maîtrisez Python en 30 Jours : Défi Codage Quotidien",
        "De Zéro à Héros : Full-Stack JavaScript en 6 Semaines",
        "24h de Code : Créez un Projet Open Source",
        "React & Redux Masterclass : Applications Web Modernes",
        "Flutter Bootcamp : Développement Mobile Cross-Platform",
        "Clean Code : Principes SOLID et Architecture Hexagonale",
        "DevOps pour Développeurs : CI/CD avec GitHub Actions",
        "API RESTful avec Spring Boot : Bonnes Pratiques",
        "Microservices en Action : Patterns et Implémentation",
        "TDD & BDD : Développement Piloté par les Tests"
      ],
      "Cloud": [
        "AWS Certified : Session de Préparation Intensive",
        "Hackathon Cloud : Construisez une App Serverless en 48h",
        "Hands-on Kubernetes : Déployez Votre Premier Cluster",
        "Azure DevOps : Pipeline CI/CD de A à Z",
        "Google Cloud Platform : Services Managés et Automatisation",
        "Infrastructure as Code avec Terraform et Ansible",
        "Conteneurisation avec Docker : Workshop Pratique",
        "Sécurité dans le Cloud : Bonnes Pratiques et Outils",
        "Optimisation des Coûts Cloud : Stratégies et Techniques",
        "Multi-Cloud : Architectures Hybrides et Portabilité"
      ],
      "Sécurité": [
        "Cybersécurité : Protégez Vos Données en 2 Heures (Live Workshop)",
        "CTF (Capture The Flag) : Défi Sécurité Informatique",
        "Battle Dev : Affrontez d'Autres Développeurs en Live",
        "Ethical Hacking : Techniques de Pentest Avancées",
        "Sécurité des Applications Web : OWASP Top 10",
        "Cryptographie Appliquée : Workshop Pratique",
        "Forensics & Analyse de Malware : Méthodologies",
        "DevSecOps : Intégration de la Sécurité dans le CI/CD",
        "Zero Trust Architecture : Implémentation et Bonnes Pratiques",
        "RGPD & Conformité : Impact sur le Développement Logiciel"
      ],
      "IA": [
        "Webinaire Expert : ChatGPT & IA Générative pour Développeurs",
        "L'IA dans le DevOps : Automatisation Avancée",
        "Découverte de Quantum Computing : Mythes et Réalités",
        "Deep Learning avec TensorFlow : Applications Pratiques",
        "Computer Vision : Détection d'Objets et Reconnaissance Faciale",
        "NLP & Traitement du Langage : Techniques Avancées",
        "MLOps : Industrialisation des Modèles d'IA",
        "IA Éthique : Biais, Transparence et Gouvernance",
        "Reinforcement Learning : Théorie et Applications",
        "IA Edge Computing : Déploiement sur Appareils Embarqués"
      ],
      "Blockchain": [
        "Blockchain 101 : Comprendre les Smart Contracts",
        "Metaverse & Web3 : Quelles Opportunités pour les Devs ?",
        "Challenge Algorithmique : Résolvez des Problèmes en Temps Réel",
        "Ethereum Development : DApps et Smart Contracts",
        "NFT Workshop : Création et Déploiement sur Marketplace",
        "DeFi (Finance Décentralisée) : Protocoles et Applications",
        "Solidity Masterclass : Patterns et Sécurité",
        "Blockchain Privée : Hyperledger Fabric pour Entreprises",
        "Tokenomics : Conception d'Économies Décentralisées",
        "Interopérabilité Blockchain : Bridges et Cross-Chain"
      ]
    };

    // Générer les recommandations
    let mockRecommendations: EventRecommendation[] = [];
    const currentDate = new Date();

    // Déterminer la catégorie à utiliser
    let selectedCategory = "Développement"; // Catégorie par défaut

    if (userPreferences && userPreferences.event_category && userPreferences.event_category !== 'all') {
      // Utiliser la catégorie sélectionnée par l'utilisateur
      selectedCategory = userPreferences.event_category;
      console.log(`Catégorie sélectionnée par l'utilisateur: ${selectedCategory}`);
    } else {
      // Si "Toutes les catégories" est sélectionné, choisir une catégorie au hasard
      const categories = Object.keys(venuesByCategory);
      selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      console.log(`Catégorie choisie aléatoirement: ${selectedCategory}`);
    }

    // Obtenir les lieux pour la catégorie sélectionnée
    const categoryVenues = venuesByCategory[selectedCategory];
    console.log(`Nombre de lieux disponibles pour la catégorie ${selectedCategory}: ${categoryVenues.length}`);

    // Générer plus d'événements en utilisant chaque lieu plusieurs fois avec des dates différentes
    // Nombre d'événements à générer par lieu (pour avoir plus de choix)
    const eventsPerVenue = 5; // Augmenté à 5 pour avoir encore plus de choix

    // Créer une liste de tous les lieux disponibles (plusieurs fois si nécessaire)
    let allVenues = [];

    // Ajouter chaque lieu plusieurs fois avec un index différent
    categoryVenues.forEach(venue => {
      for (let j = 0; j < eventsPerVenue; j++) {
        allVenues.push({
          ...venue,
          eventIndex: j // Ajouter un index pour différencier les événements du même lieu
        });
      }
    });

    console.log(`Nombre total d'événements possibles: ${allVenues.length}`);

    // Mélanger les lieux pour plus de variété
    allVenues = this.shuffleArray(allVenues);

    // Limiter le nombre de recommandations au nombre d'événements disponibles
    const actualNumRecommendations = Math.min(numRecommendations, allVenues.length);

    console.log(`Génération de ${actualNumRecommendations} recommandations pour la catégorie ${selectedCategory}`);

    // Utiliser les lieux mélangés
    const selectedVenues = allVenues.slice(0, actualNumRecommendations);

    // Générer exactement le nombre de recommandations demandé
    for (let i = 0; i < actualNumRecommendations; i++) {
      // Sélectionner un lieu pour cette recommandation
      const venue = selectedVenues[i];

      // Sélectionner un type d'événement adapté au lieu (fixe pour chaque lieu)
      let eventType = "";
      if (venue.type === "Théâtre" || venue.type === "Opéra") {
        eventType = "Spectacle";
      } else if (venue.type === "Musée") {
        eventType = "Exposition";
      } else if (venue.type === "Centre de conférences") {
        eventType = "Conférence";
      } else if (venue.type === "Centre culturel") {
        eventType = "Workshop";
      } else if (venue.type === "Amphithéâtre") {
        eventType = "Hackathon";
      } else if (venue.type === "Monument historique") {
        eventType = "Webinaire";
      } else {
        eventType = "Meetup";
      }

      // Utiliser la catégorie déjà sélectionnée pour les lieux
      let eventCategory = selectedCategory;

      // Sélectionner un titre professionnel en fonction de la catégorie
      const categoryTitles = professionalEventTitles[eventCategory];
      const titleIndex = i % categoryTitles.length;
      const eventTitle = categoryTitles[titleIndex];

      console.log(`Titre sélectionné pour l'événement ${i + 1}: ${eventTitle} (catégorie: ${eventCategory})`);

      // Générer une date en fonction de l'index de l'événement pour le même lieu
      let daysAhead, selectedHour;

      if (venue.eventIndex !== undefined) {
        // Utiliser l'index de l'événement pour varier les dates pour le même lieu
        const weekOffset = Math.floor(venue.eventIndex / 2); // 0, 0, 1, 1, 2, 2, etc.
        const dayVariation = venue.eventIndex % 2; // 0, 1, 0, 1, etc.

        // Jours en avant: 1-7 pour le premier événement, 8-14 pour le deuxième, etc.
        daysAhead = 1 + (i % 7) + (weekOffset * 7);

        // Heures: matin (9-12h) ou après-midi (14-18h) en fonction de dayVariation
        if (dayVariation === 0) {
          selectedHour = 9 + (i % 4); // 9h, 10h, 11h, 12h
        } else {
          selectedHour = 14 + (i % 5); // 14h, 15h, 16h, 17h, 18h
        }
      } else {
        // Fallback au cas où eventIndex n'est pas défini
        daysAhead = i + 1;
        selectedHour = 14 + (i % 6);
      }

      const recommendedDate = new Date(currentDate);
      recommendedDate.setDate(recommendedDate.getDate() + daysAhead);
      recommendedDate.setHours(selectedHour, 0, 0, 0);

      // Nombre de participants attendus (en tenant compte du maximum défini par l'utilisateur)
      let expectedParticipants = Math.floor(venue.capacity * 0.7);

      // Limiter au nombre maximum de participants défini par l'utilisateur
      if (userPreferences && userPreferences.max_participants) {
        expectedParticipants = Math.min(expectedParticipants, userPreferences.max_participants);
      }

      // Calculer la distance si l'utilisateur a fourni sa localisation
      let distance: number | undefined = undefined;
      let venueScore = 0.7; // Score par défaut si pas de localisation

      if (userPreferences && userPreferences.location && userPreferences.location.lat && userPreferences.location.lng) {
        // Calcul plus précis de la distance (en km) avec la formule de Haversine
        const userLat = userPreferences.location.lat;
        const userLng = userPreferences.location.lng;
        const venueLat = venue.lat;
        const venueLng = venue.lng;

        // Rayon de la Terre en km
        const R = 6371.0;

        // Conversion en radians
        const lat1 = userLat * Math.PI / 180;
        const lon1 = userLng * Math.PI / 180;
        const lat2 = venueLat * Math.PI / 180;
        const lon2 = venueLng * Math.PI / 180;

        // Différence de longitude et latitude
        const dlon = lon2 - lon1;
        const dlat = lat2 - lat1;

        // Formule de Haversine
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = Math.round(R * c * 10) / 10; // Arrondi à 1 décimale

        // Calculer le score principalement basé sur la distance
        // Plus la distance est petite, plus le score est élevé
        const maxDistance = userPreferences.max_distance || 10;

        if (distance <= maxDistance) {
          // Formule pour calculer le score: 1 - (distance / maxDistance) * 0.5
          // Cela donne un score entre 0.5 et 1.0 pour les distances dans la limite
          venueScore = Math.max(0.5, Math.min(0.95, 1 - (distance / maxDistance) * 0.5));

          // Bonus pour les très courtes distances (moins de 20% de la distance max)
          if (distance < maxDistance * 0.2) {
            venueScore = Math.min(0.95, venueScore + 0.1);
          }
        } else {
          // Pour les distances au-delà de la limite, score plus bas
          venueScore = Math.max(0.3, 0.5 - (distance - maxDistance) / maxDistance * 0.2);
        }

        // Arrondir à 2 décimales
        venueScore = Math.round(venueScore * 100) / 100;

        console.log(`Lieu: ${venue.name}, Distance: ${distance} km, Score: ${venueScore}`);
      }

      // Créer un identifiant unique pour cette recommandation
      const uniqueId = `venue-${i}`;

      // Créer la recommandation
      const recommendation: EventRecommendation = {
        date: recommendedDate.toISOString(),
        location: venue.name,
        title: eventTitle,
        type: eventType,
        category: eventCategory,
        city: venue.city || "Tunis", // Utiliser la ville du lieu ou "Tunis" par défaut
        expected_participants: expectedParticipants,
        location_score: venueScore,
        location_capacity: venue.capacity,
        coordinates: {
          lat: venue.lat,
          lng: venue.lng
        },
        uniqueId: uniqueId
      };

      // Ajouter la distance si disponible
      if (distance !== undefined) {
        recommendation.distance = distance;
      }

      mockRecommendations.push(recommendation);

      console.log(`Recommandation ${i + 1} créée: ${recommendation.title}`);
    }

    // Trier toutes les recommandations par distance (si position utilisateur disponible)
    if (userPreferences && userPreferences.location) {
      console.log("Tri de toutes les recommandations par distance...");

      // Trier toutes les recommandations par distance (les plus proches en premier)
      mockRecommendations.sort((a, b) => {
        // Si les deux ont une distance, trier par distance
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        // Si seulement a a une distance, le mettre en premier
        if (a.distance !== undefined) {
          return -1;
        }
        // Si seulement b a une distance, le mettre en premier
        if (b.distance !== undefined) {
          return 1;
        }
        // Si aucun n'a de distance, trier par score
        return b.location_score - a.location_score;
      });

      console.log("Toutes les recommandations triées par distance");

      // Filtrer strictement par la distance maximale définie par l'utilisateur
      if (userPreferences.max_distance) {
        const inRangeRecommendations = mockRecommendations.filter(rec => {
          return rec.distance !== undefined && rec.distance <= userPreferences.max_distance;
        });

        console.log(`${inRangeRecommendations.length} événements trouvés dans un rayon de ${userPreferences.max_distance} km`);

        // Si aucune recommandation n'est dans la zone, afficher un message d'erreur
        if (inRangeRecommendations.length === 0) {
          console.log("Aucun événement trouvé dans la zone définie");
          this.error = `Aucun événement trouvé dans un rayon de ${userPreferences.max_distance} km. Veuillez augmenter la distance maximale ou changer votre position.`;
          mockRecommendations = []; // Vider les recommandations
        } else {
          // Utiliser uniquement les recommandations dans la zone définie
          mockRecommendations = inRangeRecommendations;
          console.log(`Utilisation des événements dans un rayon de ${userPreferences.max_distance} km`);

          // Si nous avons moins de recommandations que demandé, informer l'utilisateur
          if (inRangeRecommendations.length < numRecommendations) {
            console.log(`Seulement ${inRangeRecommendations.length} événements trouvés sur ${numRecommendations} demandés`);
            this.warning = `Seulement ${inRangeRecommendations.length} événements trouvés dans un rayon de ${userPreferences.max_distance} km. Augmentez la distance maximale pour voir plus d'événements.`;
          } else {
            this.warning = ""; // Effacer tout avertissement précédent
          }
        }
      }
    } else {
      // Trier par score si pas de position utilisateur
      mockRecommendations.sort((a, b) => b.location_score - a.location_score);
      console.log("Recommandations triées par score (pas de position utilisateur)");
    }

    // Limiter au nombre de recommandations demandé (si nous en avons assez)
    if (mockRecommendations.length > numRecommendations) {
      mockRecommendations = mockRecommendations.slice(0, numRecommendations);
      console.log(`Nombre de recommandations limité à ${numRecommendations}`);
    }

    console.log(`Nombre final de recommandations après filtrage: ${mockRecommendations.length}`);

    // Si nous n'avons pas de recommandations, afficher un message d'erreur
    if (mockRecommendations.length === 0 && !this.error) {
      this.error = "Aucun événement trouvé avec les critères actuels. Veuillez modifier vos préférences.";
    }

    // Vérification finale
    console.log(`Nombre final de recommandations: ${mockRecommendations.length}`);

    // Afficher les détails de chaque recommandation
    mockRecommendations.forEach((rec, index) => {
      console.log(`Recommandation ${index + 1}:`, {
        id: rec.uniqueId,
        title: rec.title,
        location: rec.location,
        date: new Date(rec.date).toLocaleString(),
        coordinates: rec.coordinates,
        distance: rec.distance,
        score: rec.location_score
      });
    });

    // Mettre à jour les recommandations
    this.recommendations = mockRecommendations;
    this.loading = false;

    // Masquer le formulaire de préférences après avoir obtenu les recommandations
    this.showPreferencesForm = false;

    // Initialiser ou mettre à jour la carte après avoir obtenu les recommandations
    setTimeout(() => {
      console.log("Tentative d'initialisation ou de mise à jour de la carte");

      // Si la carte existe déjà, mettre à jour les marqueurs
      if (this.leafletMap) {
        console.log("La carte existe déjà, mise à jour des marqueurs");
        // Supprimer les anciens marqueurs
        this.leafletMarkers.forEach(marker => {
          if (marker) {
            this.leafletMap.removeLayer(marker);
          }
        });
        this.leafletMarkers = [];

        // Ajouter les nouveaux marqueurs
        this.addLeafletMarkers();

        // Ajuster la vue pour inclure tous les marqueurs
        if (this.leafletMarkers.length > 0) {
          try {
            const group = new L.FeatureGroup(this.leafletMarkers);
            this.leafletMap.fitBounds(group.getBounds(), {
              padding: [50, 50],
              maxZoom: 15
            });
            console.log("Vue de la carte ajustée pour inclure tous les marqueurs");
          } catch (error) {
            console.error("Erreur lors de l'ajustement de la vue de la carte:", error);
          }
        }
      } else {
        // Initialiser la carte si elle n'existe pas encore
        console.log("La carte n'existe pas encore, initialisation");
        this.initLeafletMap();

        // Vérifier que la carte a bien été initialisée
        if (!this.leafletMap) {
          console.error("La carte Leaflet n'a pas été initialisée correctement");
          this.error = "Erreur lors de l'initialisation de la carte. Veuillez rafraîchir la page.";
        } else {
          console.log("Carte Leaflet initialisée avec succès");
        }
      }
    }, 1000);
  }

  /**
   * Réinitialise complètement l'application
   */
  resetAll(): void {
    console.log("=== RÉINITIALISATION COMPLÈTE ===");

    // Réinitialiser les formulaires
    this.recommendationForm.reset({
      numRecommendations: 10 // Augmenté à 10 par défaut pour voir plus d'événements
    });

    this.userPreferencesForm.reset({
      location: {
        lat: 36.0000, // Position plus centrale en Tunisie
        lng: 10.5000  // Pour voir plus de villes
      },
      max_distance: 100, // Distance max pour couvrir toute la Tunisie
      max_participants: 500,
      event_category: 'all',
      preferred_days: [],
      preferred_times: []
    });

    // Ajouter des jours par défaut (mardi, jeudi)
    this.preferredDays.clear();
    this.addDayPreference(1); // Mardi
    this.addDayPreference(3); // Jeudi

    // Ajouter des heures par défaut (10h, 14h, 18h)
    this.preferredTimes.clear();
    this.addTimePreference(10);
    this.addTimePreference(14);
    this.addTimePreference(18);

    // Réinitialiser les recommandations
    this.recommendations = [];
    this.selectedRecommendation = null;

    // Détruire la carte existante
    if (this.leafletMap) {
      this.leafletMarkers.forEach(marker => {
        if (marker) {
          this.leafletMap.removeLayer(marker);
        }
      });
      this.leafletMarkers = [];
      this.leafletMap.remove();
      this.leafletMap = null;

      // Vider l'élément de carte
      const mapElement = document.getElementById('recommendation-map');
      if (mapElement) {
        mapElement.innerHTML = '';
      }
    }

    // Réinitialiser les états
    this.loading = false;
    this.error = '';
    this.mapInitialized = false;

    // Afficher le formulaire de préférences
    this.showPreferencesForm = true;

    // Réinitialiser la carte de sélection de position
    setTimeout(() => {
      this.initLocationPickerMap();
    }, 500);

    console.log("Réinitialisation terminée");
  }

  // Méthode pour basculer l'affichage du formulaire de préférences
  togglePreferencesForm(): void {
    this.showPreferencesForm = !this.showPreferencesForm;

    // Initialiser la carte de sélection de position lorsque le formulaire est affiché
    if (this.showPreferencesForm) {
      setTimeout(() => {
        this.initLocationPickerMap();
      }, 500);
    }
  }

  /**
   * Initialise la carte pour sélectionner la position de l'utilisateur
   */
  initLocationPickerMap(): void {
    console.log('Initialisation de la carte de sélection de position');

    const mapElement = document.getElementById('location-picker-map');
    if (!mapElement) {
      console.error('Élément de carte de sélection de position non trouvé');
      return;
    }

    try {
      // Vider l'élément de carte
      mapElement.innerHTML = '';

      // Récupérer les coordonnées actuelles du formulaire
      const lat = this.userPreferencesForm.get('location.lat')?.value || 36.8070;
      const lng = this.userPreferencesForm.get('location.lng')?.value || 10.1825;

      // Créer la carte
      this.locationPickerMap = L.map(mapElement).setView([lat, lng], 13);

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.locationPickerMap);

      // Ajouter un marqueur à la position actuelle
      this.locationMarker = L.marker([lat, lng], {
        draggable: true // Permettre de déplacer le marqueur
      }).addTo(this.locationPickerMap);

      // Ajouter un popup au marqueur
      this.locationMarker.bindPopup('Votre position').openPopup();

      // Mettre à jour les coordonnées lorsque le marqueur est déplacé
      this.locationMarker.on('dragend', (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();

        // Mettre à jour le formulaire
        this.userPreferencesForm.patchValue({
          location: {
            lat: position.lat,
            lng: position.lng
          }
        });

        // Mettre à jour le popup
        marker.bindPopup(`Votre position: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`).openPopup();
      });

      // Ajouter un événement de clic sur la carte pour déplacer le marqueur
      this.locationPickerMap.on('click', (event: any) => {
        const position = event.latlng;

        // Déplacer le marqueur
        this.locationMarker.setLatLng(position);

        // Mettre à jour le formulaire
        this.userPreferencesForm.patchValue({
          location: {
            lat: position.lat,
            lng: position.lng
          }
        });

        // Mettre à jour le popup
        this.locationMarker.bindPopup(`Votre position: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`).openPopup();
      });

      console.log('Carte de sélection de position initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte de sélection de position:', error);
    }
  }

  getLocations(): void {
    // Utiliser des données fictives pour les lieux
    const useMockData = true; // Mettre à true pour utiliser des données fictives

    if (useMockData) {
      // Générer des lieux fictifs
      this.generateMockLocations();
    } else {
      // Essayer d'obtenir les lieux via le service
      this.predictService.getLocations().subscribe({
        next: (data) => {
          this.locations = data;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des lieux:', err);
          // Générer des lieux fictifs en cas d'erreur
          this.generateMockLocations();
        }
      });
    }
  }

  /**
   * Génère des lieux fictifs pour la démonstration
   */
  generateMockLocations(): void {
    console.log('Génération de lieux fictifs');

    // Lieux fictifs
    const mockLocations: LocationInfo[] = [
      {
        name: "Salle A",
        score: 0.85,
        capacity: 30,
        coordinates: { lat: 36.8065, lng: 10.1815 }
      },
      {
        name: "Salle B",
        score: 0.75,
        capacity: 40,
        coordinates: { lat: 36.8068, lng: 10.1820 }
      },
      {
        name: "Salle C",
        score: 0.65,
        capacity: 25,
        coordinates: { lat: 36.8070, lng: 10.1825 }
      },
      {
        name: "Amphithéâtre",
        score: 0.90,
        capacity: 150,
        coordinates: { lat: 36.8075, lng: 10.1830 }
      },
      {
        name: "Espace Co-working",
        score: 0.80,
        capacity: 60,
        coordinates: { lat: 36.8080, lng: 10.1835 }
      }
    ];

    // Mettre à jour les lieux
    this.locations = mockLocations;
  }

  selectRecommendation(recommendation: EventRecommendation): void {
    this.selectedRecommendation = recommendation;

    // Centrer la carte Leaflet sur la recommandation sélectionnée
    if (this.leafletMap && recommendation.coordinates) {
      const position = [recommendation.coordinates.lat, recommendation.coordinates.lng];

      this.leafletMap.setView(position, 15);

      // Mettre en évidence le marqueur correspondant
      this.highlightLeafletMarker(recommendation);
    }
  }

  /**
   * Initialise une carte Leaflet (OpenStreetMap)
   */
  initLeafletMap(): void {
    console.log('Tentative d\'initialisation de la carte Leaflet');

    // Vérifier si la carte est déjà initialisée ou s'il n'y a pas de recommandations
    if (this.mapInitialized) {
      console.log('Carte déjà initialisée');
      return;
    }

    if (!this.recommendations.length) {
      console.log('Aucune recommandation disponible pour la carte');
      return;
    }

    const mapElement = document.getElementById('recommendation-map');
    if (!mapElement) {
      console.error('Élément de carte non trouvé');

      // Attendre que le DOM soit complètement chargé
      setTimeout(() => {
        const retryMapElement = document.getElementById('recommendation-map');
        if (retryMapElement) {
          console.log('Élément de carte trouvé après délai');
          this.initLeafletMap();
        } else {
          console.error('Élément de carte toujours introuvable après délai');
        }
      }, 1000);

      return;
    }

    try {
      console.log('Initialisation de Leaflet');

      // Vider l'élément de carte
      mapElement.innerHTML = '';

      // Coordonnées par défaut (centre de Tunis)
      const defaultPosition = [36.8065, 10.1815];

      // Créer la carte
      this.leafletMap = L.map(mapElement).setView(defaultPosition, 13);

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.leafletMap);

      // Ajouter des marqueurs pour chaque recommandation
      this.addLeafletMarkers();

      this.mapInitialized = true;
      console.log('Leaflet initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte Leaflet:', error);
      this.error = 'Erreur lors de l\'initialisation de la carte: ' + (error as Error).message;

      // Créer une carte de secours en cas d'erreur
      this.createFallbackMap(mapElement);
    }
  }

  initMap(): void {
    console.log('Tentative d\'initialisation de la carte Google Maps');

    // Vérifier si la carte est déjà initialisée ou s'il n'y a pas de recommandations
    if (this.mapInitialized) {
      console.log('Carte déjà initialisée');
      return;
    }

    if (!this.recommendations.length) {
      console.log('Aucune recommandation disponible pour la carte');
      return;
    }

    const mapElement = document.getElementById('recommendation-map');
    if (!mapElement) {
      console.error('Élément de carte non trouvé');

      // Attendre que le DOM soit complètement chargé
      setTimeout(() => {
        const retryMapElement = document.getElementById('recommendation-map');
        if (retryMapElement) {
          console.log('Élément de carte trouvé après délai');
          this.initMap();
        } else {
          console.error('Élément de carte toujours introuvable après délai');
        }
      }, 1000);

      return;
    }

    // Vérifier si l'API Google Maps est chargée
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.error('Google Maps API n\'est pas chargée');

      // Créer une carte statique comme solution de secours
      this.createFallbackMap(mapElement);

      // Attendre un peu et réessayer
      console.log('Attente de 3 secondes avant de réessayer...');
      setTimeout(() => {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
          console.log('Google Maps API chargée après délai, initialisation de la carte');
          this.initMap();
        } else {
          console.error('Google Maps API toujours non disponible après délai');
        }
      }, 3000);

      return;
    }

    try {
      console.log('Initialisation de Google Maps');

      // Coordonnées par défaut (centre de Tunis)
      const defaultPosition = { lat: 36.8065, lng: 10.1815 };

      // Options de la carte
      const mapOptions = {
        center: defaultPosition,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#444444" }],
          },
          {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f2f2f2" }],
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ saturation: -100 }, { lightness: 45 }],
          },
          {
            featureType: "road.highway",
            elementType: "all",
            stylers: [{ visibility: "simplified" }],
          },
          {
            featureType: "road.arterial",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#4299e1" }, { visibility: "on" }],
          },
        ],
      };

      // Créer la carte
      this.map = new google.maps.Map(mapElement, mapOptions);
      console.log('Carte créée avec succès');

      // Ajouter des marqueurs pour chaque recommandation
      this.addMarkers();

      this.mapInitialized = true;
      console.log('Google Maps initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      this.error = 'Erreur lors de l\'initialisation de la carte: ' + (error as Error).message;
    }
  }

  /**
   * Initialise une carte statique lorsque Google Maps n'est pas disponible
   */
  initStaticMap(): void {
    console.log('Initialisation de la carte statique');

    if (this.mapInitialized) {
      console.log('Carte déjà initialisée');
      return;
    }

    if (!this.recommendations.length) {
      console.log('Aucune recommandation disponible pour la carte');
      return;
    }

    const mapElement = document.getElementById('recommendation-map');
    if (!mapElement) {
      console.error('Élément de carte non trouvé');
      return;
    }

    try {
      // Vider l'élément de carte
      mapElement.innerHTML = '';

      // Ajouter un style à l'élément de carte
      mapElement.style.position = 'relative';
      mapElement.style.backgroundColor = '#f0f0f0';
      mapElement.style.border = '1px solid #ccc';
      mapElement.style.borderRadius = '5px';
      mapElement.style.overflow = 'hidden';

      // Créer une URL pour l'image de carte statique
      let staticMapUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
      staticMapUrl += 'center=36.8070,10.1825'; // Centre de Tunis
      staticMapUrl += '&zoom=13';
      staticMapUrl += '&size=600x400';
      staticMapUrl += '&scale=2'; // Pour les écrans haute résolution
      staticMapUrl += '&key=AIzaSyBhIk-9XUyzX8EVfHQJNkIxnXXh3A9Ri_0';

      // Ajouter des marqueurs pour chaque recommandation
      this.recommendations.forEach((recommendation, index) => {
        if (recommendation.coordinates) {
          staticMapUrl += `&markers=color:red%7Clabel:${index + 1}%7C${recommendation.coordinates.lat},${recommendation.coordinates.lng}`;
        }
      });

      // Ajouter l'image de fond (carte statique)
      const mapBackground = document.createElement('div');
      mapBackground.style.position = 'absolute';
      mapBackground.style.top = '0';
      mapBackground.style.left = '0';
      mapBackground.style.width = '100%';
      mapBackground.style.height = '100%';
      mapBackground.style.backgroundImage = `url("${staticMapUrl}")`;
      mapBackground.style.backgroundSize = 'cover';
      mapBackground.style.backgroundPosition = 'center';
      mapElement.appendChild(mapBackground);

      // Ajouter un message d'information
      const infoMessage = document.createElement('div');
      infoMessage.style.position = 'absolute';
      infoMessage.style.bottom = '10px';
      infoMessage.style.left = '10px';
      infoMessage.style.right = '10px';
      infoMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      infoMessage.style.padding = '10px';
      infoMessage.style.borderRadius = '5px';
      infoMessage.style.fontSize = '14px';
      infoMessage.style.textAlign = 'center';
      infoMessage.innerHTML = 'Mode carte statique : Google Maps interactif n\'est pas disponible. <br>Les marqueurs numérotés correspondent aux recommandations dans la liste. <br>Cliquez sur une recommandation pour ouvrir Google Maps.';
      mapElement.appendChild(infoMessage);

      // Ajouter des zones cliquables pour chaque recommandation
      this.recommendations.forEach((recommendation, index) => {
        if (recommendation.coordinates) {
          // Créer une zone cliquable
          const clickableArea = document.createElement('a');
          clickableArea.href = this.createGoogleMapsUrl(recommendation.coordinates.lat, recommendation.coordinates.lng, recommendation.location);
          clickableArea.target = '_blank';
          clickableArea.style.position = 'absolute';

          // Calculer la position approximative du marqueur sur l'image
          const latRange = [36.8050, 36.8100]; // Plage de latitude visible sur la carte
          const lngRange = [10.1800, 10.1850]; // Plage de longitude visible sur la carte

          const x = ((recommendation.coordinates.lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
          const y = (1 - (recommendation.coordinates.lat - latRange[0]) / (latRange[1] - latRange[0])) * 100;

          clickableArea.style.left = `${x}%`;
          clickableArea.style.top = `${y}%`;
          clickableArea.style.width = '30px';
          clickableArea.style.height = '30px';
          clickableArea.style.transform = 'translate(-50%, -50%)';
          clickableArea.style.borderRadius = '50%';
          clickableArea.style.cursor = 'pointer';
          clickableArea.style.zIndex = '2';
          clickableArea.title = `Ouvrir ${recommendation.location} dans Google Maps`;

          // Ajouter la zone cliquable à la carte
          mapElement.appendChild(clickableArea);
        }
      });

      this.mapInitialized = true;
      console.log('Carte statique initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte statique:', error);
      this.error = 'Erreur lors de l\'initialisation de la carte: ' + (error as Error).message;
    }
  }

  /**
   * Affiche une info-bulle pour une recommandation (utilisée avec la carte statique)
   */
  showInfoWindow(recommendation: EventRecommendation, marker: HTMLElement, container: HTMLElement): void {
    // Supprimer les info-bulles existantes
    document.querySelectorAll('.info-window').forEach(infoWindow => {
      infoWindow.remove();
    });

    // Créer une info-bulle
    const infoWindow = document.createElement('div');
    infoWindow.classList.add('info-window');
    infoWindow.style.position = 'absolute';
    infoWindow.style.left = marker.style.left;
    infoWindow.style.top = '0';
    infoWindow.style.transform = 'translate(-50%, -110%)';
    infoWindow.style.backgroundColor = 'white';
    infoWindow.style.padding = '10px';
    infoWindow.style.borderRadius = '5px';
    infoWindow.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    infoWindow.style.zIndex = '3';
    infoWindow.style.minWidth = '200px';
    infoWindow.style.maxWidth = '250px';

    // Contenu de l'info-bulle
    infoWindow.innerHTML = `
      <h3 style="font-weight: bold; margin-bottom: 5px;">${recommendation.location}</h3>
      <p style="margin: 5px 0;"><i class="fas fa-calendar-alt"></i> ${new Date(recommendation.date).toLocaleString()}</p>
      <p style="margin: 5px 0;"><i class="fas fa-users"></i> Participants: ~${recommendation.expected_participants}</p>
      <p style="margin: 5px 0;"><i class="fas fa-building"></i> Capacité: ${recommendation.location_capacity}</p>
      ${recommendation.distance ? `<p style="margin: 5px 0;"><i class="fas fa-map-marker-alt"></i> Distance: ${recommendation.distance} km</p>` : ''}
    `;

    // Ajouter l'info-bulle au conteneur
    container.appendChild(infoWindow);
  }

  /**
   * Ajoute des marqueurs pour chaque recommandation sur la carte Google Maps
   */
  addMarkers(): void {
    if (!this.map) {
      console.error('Carte non initialisée');
      return;
    }

    try {
      // Supprimer les marqueurs existants
      this.markers.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      this.markers = [];

      // Ajouter un marqueur pour chaque recommandation
      this.recommendations.forEach((recommendation, index) => {
        if (!recommendation.coordinates) {
          console.warn('Coordonnées manquantes pour la recommandation:', recommendation);
          return;
        }

        const position = {
          lat: recommendation.coordinates.lat,
          lng: recommendation.coordinates.lng
        };

        try {
          const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            animation: google.maps.Animation.DROP,
            title: recommendation.location,
            label: (index + 1).toString(),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4299e1',
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: '#2b6cb0'
            }
          });

          // Créer le lien Google Maps
          const googleMapsUrl = this.createGoogleMapsUrl(recommendation.coordinates.lat, recommendation.coordinates.lng, recommendation.location);

          // Déterminer le titre à afficher
          const displayTitle = recommendation.title || recommendation.location;

          // Ajouter une fenêtre d'info avec lien vers Google Maps
          const infoContent = `
            <div class="info-window-content">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${displayTitle}</h3>
              <p style="margin: 5px 0;"><i class="fas fa-map-marker-alt"></i> ${recommendation.location}</p>
              ${recommendation.type ? `<p style="margin: 5px 0;"><i class="fas fa-tag"></i> ${recommendation.type}</p>` : ''}
              <p style="margin: 5px 0;"><i class="fas fa-calendar-alt"></i> ${new Date(recommendation.date).toLocaleString()}</p>
              <p style="margin: 5px 0;"><i class="fas fa-users"></i> Participants attendus: ~${recommendation.expected_participants}</p>
              <p style="margin: 5px 0;"><i class="fas fa-building"></i> Capacité: ${recommendation.location_capacity}</p>
              ${recommendation.distance ? `<p style="margin: 5px 0;"><i class="fas fa-route"></i> Distance: ${recommendation.distance} km</p>` : ''}
              ${recommendation.description ? `<p style="margin: 8px 0; font-style: italic;">${recommendation.description}</p>` : ''}
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoContent
          });

          marker.addListener('click', () => {
            // Fermer toutes les fenêtres d'info ouvertes
            this.markers.forEach(m => {
              if (m && m.infoWindow) {
                m.infoWindow.close();
              }
            });

            // Ouvrir cette fenêtre d'info
            infoWindow.open(this.map, marker);

            // Sélectionner cette recommandation
            this.selectRecommendation(recommendation);
          });

          // Stocker la référence à la fenêtre d'info
          marker.infoWindow = infoWindow;

          this.markers.push(marker);
        } catch (markerError) {
          console.error('Erreur lors de la création du marqueur:', markerError);
        }
      });

      // Ajuster la vue pour inclure tous les marqueurs
      if (this.markers.length > 0) {
        try {
          const bounds = new google.maps.LatLngBounds();
          this.markers.forEach(marker => {
            if (marker && typeof marker.getPosition === 'function') {
              bounds.extend(marker.getPosition());
            }
          });
          this.map.fitBounds(bounds);
        } catch (boundsError) {
          console.error('Erreur lors de l\'ajustement des limites de la carte:', boundsError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des marqueurs:', error);
    }
  }

  /**
   * Met en évidence un marqueur sur la carte Google Maps
   */
  highlightMarker(recommendation: EventRecommendation): void {
    console.log('Mise en évidence du marqueur pour', recommendation.location);

    if (!this.map) {
      console.error('Carte non initialisée');
      return;
    }

    try {
      // Réinitialiser tous les marqueurs
      this.markers.forEach(marker => {
        try {
          if (marker) {
            marker.setAnimation(null);
            marker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4299e1',
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: '#2b6cb0'
            });

            // Fermer les fenêtres d'info
            if (marker.infoWindow) {
              marker.infoWindow.close();
            }
          }
        } catch (resetError) {
          console.error('Erreur lors de la réinitialisation du marqueur:', resetError);
        }
      });

      if (!recommendation.coordinates) {
        console.warn('Coordonnées manquantes pour la recommandation:', recommendation);
        return;
      }

      // Trouver l'index de la recommandation
      const recommendationIndex = this.recommendations.findIndex(r => r === recommendation);
      if (recommendationIndex === -1 || recommendationIndex >= this.markers.length) {
        console.warn('Marqueur non trouvé pour la recommandation:', recommendation);
        return;
      }

      // Récupérer le marqueur correspondant
      const marker = this.markers[recommendationIndex];

      if (marker) {
        try {
          // Mettre en évidence le marqueur
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f56565',
            fillOpacity: 0.9,
            strokeWeight: 3,
            strokeColor: '#c53030'
          });

          // Ouvrir la fenêtre d'info
          if (marker.infoWindow) {
            marker.infoWindow.open(this.map, marker);
          }

          // Centrer la carte sur le marqueur
          this.map.panTo(marker.getPosition());
        } catch (highlightError) {
          console.error('Erreur lors de la mise en évidence du marqueur:', highlightError);
        }
      } else {
        console.warn('Marqueur non trouvé pour la recommandation:', recommendation);
      }
    } catch (error) {
      console.error('Erreur lors de la mise en évidence du marqueur:', error);
    }
  }

  /**
   * Ajoute des marqueurs pour chaque recommandation sur la carte Leaflet
   */
  addLeafletMarkers(): void {
    if (!this.leafletMap) {
      console.error('Carte Leaflet non initialisée');
      return;
    }

    try {
      console.log('Ajout de marqueurs pour', this.recommendations.length, 'recommandations');

      // Supprimer les marqueurs existants
      this.leafletMarkers.forEach(marker => {
        if (marker) {
          this.leafletMap.removeLayer(marker);
        }
      });
      this.leafletMarkers = [];

      // Vérifier que nous avons des recommandations
      if (this.recommendations.length === 0) {
        console.warn('Aucune recommandation à afficher sur la carte');
        return;
      }

      // Créer un tableau pour stocker les positions uniques
      const uniquePositions = new Map();

      // Identifier les positions dupliquées et ajuster légèrement leurs coordonnées
      this.recommendations.forEach((recommendation, index) => {
        if (!recommendation.coordinates) {
          console.warn('Coordonnées manquantes pour la recommandation:', recommendation);
          return;
        }

        const key = `${recommendation.coordinates.lat.toFixed(6)},${recommendation.coordinates.lng.toFixed(6)}`;

        if (uniquePositions.has(key)) {
          // Position dupliquée, ajuster légèrement les coordonnées
          const count = uniquePositions.get(key) + 1;
          uniquePositions.set(key, count);

          // Créer un petit décalage en spirale autour du point original
          const angle = count * (Math.PI / 4); // 45 degrés entre chaque point
          const radius = 0.0005 * count; // Environ 50 mètres par niveau

          // Ajuster les coordonnées
          recommendation.displayCoordinates = {
            lat: recommendation.coordinates.lat + radius * Math.cos(angle),
            lng: recommendation.coordinates.lng + radius * Math.sin(angle)
          };

          console.log(`Position ajustée pour ${recommendation.location} (${count}): ${recommendation.displayCoordinates.lat}, ${recommendation.displayCoordinates.lng}`);
        } else {
          // Première occurrence de cette position
          uniquePositions.set(key, 1);
          recommendation.displayCoordinates = { ...recommendation.coordinates };
        }
      });

      // Ajouter un marqueur pour chaque recommandation
      this.recommendations.forEach((recommendation, index) => {
        if (!recommendation.displayCoordinates) {
          console.warn('Coordonnées d\'affichage manquantes pour la recommandation:', recommendation);
          return;
        }

        const position = [recommendation.displayCoordinates.lat, recommendation.displayCoordinates.lng];

        try {
          // Créer une icône personnalisée avec un numéro et une couleur unique
          // Utiliser une couleur différente pour chaque recommandation
          const hue = (index * 30) % 360; // Variation de teinte pour chaque marqueur
          const backgroundColor = `hsl(${hue}, 70%, 50%)`;
          const borderColor = `hsl(${hue}, 70%, 40%)`;

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${backgroundColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid ${borderColor};">${index + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          // Créer le marqueur
          const marker = L.marker(position as [number, number], { icon: customIcon }).addTo(this.leafletMap);

          // Déterminer le titre à afficher
          const displayTitle = recommendation.title || recommendation.location;

          // Créer le contenu du popup avec plus d'informations pour différencier les événements
          const popupContent = `
            <div class="popup-content">
              <h3 style="color: ${backgroundColor}; margin-top: 0; border-bottom: 2px solid ${backgroundColor}; padding-bottom: 5px;">${index + 1}. ${displayTitle}</h3>
              <p><i class="fas fa-map-marker-alt"></i> <strong>${recommendation.location}</strong></p>
              ${recommendation.type ? `<p><i class="fas fa-tag"></i> <strong>${recommendation.type}</strong></p>` : ''}
              <p><i class="fas fa-calendar-alt"></i> <strong>${new Date(recommendation.date).toLocaleString()}</strong></p>
              <p><i class="fas fa-users"></i> Participants attendus: ~${recommendation.expected_participants}</p>
              <p><i class="fas fa-building"></i> Capacité: ${recommendation.location_capacity} personnes</p>
              ${recommendation.distance ? `<p><i class="fas fa-route"></i> Distance: ${recommendation.distance} km</p>` : ''}
              ${recommendation.description ? `<p style="font-style: italic; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">${recommendation.description}</p>` : ''}
            </div>
          `;

          // Ajouter le popup au marqueur
          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          });

          // Ajouter un événement de clic sur le marqueur
          marker.on('click', () => {
            // Sélectionner cette recommandation
            this.selectRecommendation(recommendation);
          });

          this.leafletMarkers.push(marker);
        } catch (markerError) {
          console.error('Erreur lors de la création du marqueur Leaflet:', markerError);
        }
      });

      // Ajuster la vue pour inclure tous les marqueurs
      if (this.leafletMarkers.length > 0) {
        try {
          const group = new L.FeatureGroup(this.leafletMarkers);
          this.leafletMap.fitBounds(group.getBounds(), {
            padding: [50, 50], // Ajouter une marge autour des marqueurs
            maxZoom: 15 // Limiter le zoom pour éviter un zoom trop important sur un seul marqueur
          });
        } catch (boundsError) {
          console.error('Erreur lors de l\'ajustement des limites de la carte Leaflet:', boundsError);
        }
      }

      console.log('Marqueurs ajoutés avec succès:', this.leafletMarkers.length);
    } catch (error) {
      console.error('Erreur lors de l\'ajout des marqueurs Leaflet:', error);
    }
  }

  /**
   * Met en évidence un marqueur sur la carte Leaflet
   */
  highlightLeafletMarker(recommendation: EventRecommendation): void {
    if (!this.leafletMap) {
      console.warn('Carte Leaflet non disponible');
      return;
    }

    try {
      console.log('Mise en évidence du marqueur pour:', recommendation.title || recommendation.location);

      // Fermer tous les popups
      this.leafletMap.closePopup();

      // Trouver le marqueur correspondant à la recommandation
      let markerIndex = -1;

      // Utiliser l'identifiant unique s'il existe
      if (recommendation.uniqueId) {
        markerIndex = this.recommendations.findIndex(r => r.uniqueId === recommendation.uniqueId);
      } else {
        // Sinon, utiliser une combinaison de propriétés pour identifier la recommandation
        markerIndex = this.recommendations.findIndex(r =>
          r.location === recommendation.location &&
          r.date === recommendation.date &&
          r.type === recommendation.type
        );
      }

      if (markerIndex === -1) {
        console.warn('Marqueur non trouvé pour la recommandation:', recommendation);
        return;
      }

      const marker = this.leafletMarkers[markerIndex];
      if (!marker) {
        console.warn('Marqueur non disponible à l\'index:', markerIndex);
        return;
      }

      // Centrer la carte sur le marqueur
      this.leafletMap.setView(marker.getLatLng(), 15);

      // Ouvrir le popup de ce marqueur
      marker.openPopup();

      // Ajouter une animation au marqueur (pulsation)
      const icon = marker.getElement();
      if (icon) {
        // Ajouter une classe pour l'animation
        icon.classList.add('marker-pulse');

        // Retirer la classe après 2 secondes
        setTimeout(() => {
          icon.classList.remove('marker-pulse');
        }, 2000);
      }

      console.log('Marqueur mis en évidence avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise en évidence du marqueur:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getScoreClass(score: number): string {
    if (score >= 0.85) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getScoreText(score: number): string {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.7) return 'Bon';
    if (score >= 0.5) return 'Moyen';
    return 'Faible';
  }

  /**
   * Retourne les couleurs de dégradé pour une carte de recommandation
   * @param index Index de la recommandation
   * @returns Chaîne de couleurs pour le dégradé CSS
   */
  getGradientColors(index: number): string {
    // Palette de couleurs pour les dégradés
    const gradients = [
      '#4F46E5, #7C3AED', // Indigo à Violet
      '#3B82F6, #2DD4BF', // Bleu à Turquoise
      '#8B5CF6, #EC4899', // Violet à Rose
      '#10B981, #3B82F6', // Vert à Bleu
      '#F59E0B, #EF4444', // Ambre à Rouge
      '#6366F1, #F472B6', // Indigo à Rose
      '#0EA5E9, #14B8A6', // Bleu ciel à Turquoise
      '#8B5CF6, #6366F1', // Violet à Indigo
      '#F97316, #F59E0B', // Orange à Ambre
      '#06B6D4, #0EA5E9'  // Cyan à Bleu ciel
    ];

    // Utiliser l'index modulo le nombre de dégradés disponibles
    return gradients[index % gradients.length];
  }

  /**
   * Mélange un tableau de manière aléatoire (algorithme de Fisher-Yates)
   * @param array Tableau à mélanger
   * @returns Tableau mélangé
   */
  shuffleArray(array: any[]): any[] {
    // Créer une copie du tableau pour ne pas modifier l'original
    const shuffled = [...array];

    // Algorithme de Fisher-Yates
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Échange
    }

    return shuffled;
  }

  /**
   * Crée une carte de secours simple lorsque Google Maps n'est pas disponible
   * @param mapElement Élément HTML pour la carte
   */
  createFallbackMap(mapElement: HTMLElement): void {
    console.log('Création d\'une carte de secours');

    // Vider l'élément de carte
    mapElement.innerHTML = '';

    // Ajouter un style à l'élément de carte
    mapElement.style.position = 'relative';
    mapElement.style.backgroundColor = '#f0f0f0';
    mapElement.style.border = '1px solid #ccc';
    mapElement.style.borderRadius = '5px';
    mapElement.style.overflow = 'hidden';
    mapElement.style.height = '400px';

    // Créer un conteneur pour les marqueurs
    const markersContainer = document.createElement('div');
    markersContainer.style.position = 'relative';
    markersContainer.style.width = '100%';
    markersContainer.style.height = '100%';
    mapElement.appendChild(markersContainer);

    // Ajouter un message d'information
    const infoMessage = document.createElement('div');
    infoMessage.style.position = 'absolute';
    infoMessage.style.top = '50%';
    infoMessage.style.left = '50%';
    infoMessage.style.transform = 'translate(-50%, -50%)';
    infoMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    infoMessage.style.padding = '20px';
    infoMessage.style.borderRadius = '5px';
    infoMessage.style.textAlign = 'center';
    infoMessage.style.maxWidth = '80%';
    infoMessage.innerHTML = `
      <h3 style="margin-top: 0; color: #3182ce;">Carte en cours de chargement</h3>
      <p>Nous essayons de charger Google Maps...</p>
      <p>Veuillez patienter ou rafraîchir la page si la carte ne s'affiche pas.</p>
      <div style="margin-top: 15px;">
        <button id="retry-map-button" style="background-color: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Réessayer
        </button>
      </div>
    `;
    markersContainer.appendChild(infoMessage);

    // Ajouter un événement de clic au bouton de réessai
    setTimeout(() => {
      const retryButton = document.getElementById('retry-map-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          console.log('Tentative de rechargement de la carte');
          this.initMap();
        });
      }
    }, 100);

    // Ajouter une liste des recommandations
    const recommendationsList = document.createElement('div');
    recommendationsList.style.position = 'absolute';
    recommendationsList.style.bottom = '10px';
    recommendationsList.style.left = '10px';
    recommendationsList.style.right = '10px';
    recommendationsList.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    recommendationsList.style.padding = '10px';
    recommendationsList.style.borderRadius = '5px';
    recommendationsList.style.maxHeight = '150px';
    recommendationsList.style.overflowY = 'auto';

    // Ajouter les recommandations à la liste
    let listContent = '<h4 style="margin-top: 0; margin-bottom: 10px;">Lieux recommandés:</h4><ul style="margin: 0; padding-left: 20px;">';
    this.recommendations.forEach((recommendation, index) => {
      listContent += `<li style="margin-bottom: 5px;"><strong>${index + 1}. ${recommendation.title || recommendation.location}</strong> - ${new Date(recommendation.date).toLocaleString()}</li>`;
    });
    listContent += '</ul>';
    recommendationsList.innerHTML = listContent;

    markersContainer.appendChild(recommendationsList);
  }

  /**
   * Crée une URL pour ouvrir Google Maps avec les coordonnées spécifiées
   * @param lat Latitude
   * @param lng Longitude
   * @param name Nom du lieu (optionnel)
   * @returns URL Google Maps
   */
  createGoogleMapsUrl(lat: number, lng: number, name?: string): string {
    // Format de base: https://www.google.com/maps/search/?api=1&query=36.8065,10.1815
    let url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    // Ajouter le nom du lieu s'il est fourni
    if (name) {
      url += `&query_place_id=${encodeURIComponent(name)}`;
    }

    return url;
  }
}
