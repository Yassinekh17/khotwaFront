from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import random
import json
import math
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# HTML template pour la page d'accueil
HOME_PAGE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>API d'Optimisation des Événements</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c5282;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 10px;
        }
        h2 {
            color: #3182ce;
            margin-top: 30px;
        }
        code {
            background-color: #f7fafc;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
            border: 1px solid #e2e8f0;
        }
        pre {
            background-color: #f7fafc;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
        }
        .endpoint {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 5px;
            border-left: 4px solid #3182ce;
        }
        .method {
            font-weight: bold;
            color: #2c5282;
        }
        .url {
            font-family: monospace;
            color: #2b6cb0;
        }
    </style>
</head>
<body>
    <h1>API d'Optimisation des Événements</h1>
    <p>
        Cette API fournit des recommandations de dates et lieux pour maximiser la participation aux événements.
        Elle utilise des algorithmes de machine learning pour analyser les données historiques et identifier les meilleures pratiques.
    </p>

    <h2>Endpoints disponibles</h2>

    <div class="endpoint">
        <p><span class="method">POST</span> <span class="url">/api/predict</span></p>
        <p>Prédit la catégorie d'un événement en fonction de son titre.</p>
        <p>Exemple de requête :</p>
        <pre>
{
  "title": "Workshop Python"
}
        </pre>
        <p>Exemple de réponse :</p>
        <pre>
{
  "prediction": "Atelier"
}
        </pre>
    </div>

    <div class="endpoint">
        <p><span class="method">POST</span> <span class="url">/api/recommend</span></p>
        <p>Recommande des dates et lieux optimaux pour maximiser la participation.</p>
        <p>Exemple de requête :</p>
        <pre>
{
  "num_recommendations": 3
}
        </pre>
        <p>Exemple de réponse :</p>
        <pre>
{
  "recommendations": [
    {
      "date": "2025-05-14T14:00:00",
      "location": "Amphithéâtre",
      "expected_participants": 120,
      "location_score": 0.85,
      "location_capacity": 150,
      "coordinates": {
        "lat": 36.8075,
        "lng": 10.1830
      }
    },
    ...
  ]
}
        </pre>
    </div>

    <div class="endpoint">
        <p><span class="method">GET</span> <span class="url">/api/locations</span></p>
        <p>Renvoie tous les lieux disponibles avec leurs scores.</p>
        <p>Exemple de réponse :</p>
        <pre>
{
  "locations": [
    {
      "name": "Amphithéâtre",
      "score": 0.85,
      "capacity": 150,
      "coordinates": {
        "lat": 36.8075,
        "lng": 10.1830
      }
    },
    ...
  ]
}
        </pre>
    </div>

    <h2>Utilisation avec l'interface utilisateur</h2>
    <p>
        Cette API est conçue pour être utilisée avec l'interface utilisateur Angular disponible à l'adresse
        <a href="http://localhost:4200">http://localhost:4200</a>.
    </p>
    <p>
        Pour utiliser le système de recommandation :
    </p>
    <ol>
        <li>Accédez à <a href="http://localhost:4200">http://localhost:4200</a></li>
        <li>Cliquez sur "Recommandations IA" dans la barre de navigation</li>
        <li>Entrez le nombre de recommandations souhaité (1-10)</li>
        <li>Cliquez sur "Générer des recommandations"</li>
    </ol>
</body>
</html>
"""

# Créer le dossier models s'il n'existe pas
os.makedirs('models', exist_ok=True)

# Charger les données de test depuis le fichier JSON
try:
    with open('test_data.json', 'r', encoding='utf-8') as f:
        test_data = json.load(f)
        sample_events = test_data.get('events', [])
        locations = test_data.get('locations', {})
        user_density = test_data.get('user_density', {})
        print(f"Données de test chargées: {len(sample_events)} événements, {len(locations)} lieux, {len(user_density)} zones")
except Exception as e:
    print(f"Erreur lors du chargement des données de test: {e}")
    # Données fictives de secours
    sample_events = [
        {"eventId": 1, "title": "Workshop Python", "date": "2023-05-15T14:00:00", "location": "Salle A", "participants": 25},
        {"eventId": 2, "title": "Conférence IA", "date": "2023-05-16T10:00:00", "location": "Amphithéâtre", "participants": 120}
    ]
    locations = {
        "Salle A": {"lat": 36.8065, "lng": 10.1815, "capacity": 30},
        "Amphithéâtre": {"lat": 36.8075, "lng": 10.1830, "capacity": 150}
    }
    user_density = {
        "Zone Centre": {"lat": 36.8070, "lng": 10.1825, "density": 0.8}
    }

def calculate_location_scores():
    """Calcule un score pour chaque lieu en fonction des données fictives"""
    location_scores = {}

    for location, info in locations.items():
        # Score basé sur la capacité
        capacity_score = min(info["capacity"] / 100, 1.0)

        # Score basé sur la popularité (fictif)
        popularity_score = random.uniform(0.3, 0.9)

        # Score basé sur la densité d'utilisateurs à proximité
        closest_zone = min(user_density.values(),
                          key=lambda z: ((z["lat"] - info["lat"])**2 + (z["lng"] - info["lng"])**2)**0.5)
        density_score = closest_zone["density"]

        # Score final combiné
        final_score = (capacity_score * 0.3) + (popularity_score * 0.4) + (density_score * 0.3)

        location_scores[location] = {
            "score": final_score,
            "capacity": info["capacity"],
            "lat": info["lat"],
            "lng": info["lng"]
        }

    return location_scores

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calcule la distance en km entre deux points géographiques"""
    # Rayon de la Terre en km
    R = 6371.0

    # Conversion en radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Différence de longitude et latitude
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Formule de Haversine
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance

def generate_recommendations(num_recommendations=3):
    """Génère des recommandations de dates et lieux basées sur des données fictives"""
    # Cette fonction est maintenant un wrapper pour generate_recommendations_with_preferences
    # avec des préférences par défaut
    return generate_recommendations_with_preferences(
        num_recommendations=num_recommendations,
        user_location={},
        preferred_days=[],
        preferred_times=[],
        max_distance=10
    )

def generate_recommendations_with_preferences(num_recommendations=3, user_location={}, preferred_days=[], preferred_times=[], max_distance=10):
    """Génère des recommandations de dates et lieux basées sur les préférences de l'utilisateur"""
    location_scores = calculate_location_scores()

    # Si l'utilisateur a spécifié une localisation, ajuster les scores en fonction de la distance
    if user_location and 'lat' in user_location and 'lng' in user_location:
        user_lat = user_location['lat']
        user_lng = user_location['lng']

        # Ajuster les scores en fonction de la distance
        for location, info in location_scores.items():
            distance = calculate_distance(user_lat, user_lng, info['lat'], info['lng'])

            # Si la distance est supérieure à la distance maximale, réduire le score
            if distance > max_distance:
                distance_factor = max(0, 1 - ((distance - max_distance) / 10))
                info['score'] = info['score'] * distance_factor

            # Ajouter la distance à l'information du lieu
            info['distance'] = round(distance, 2)

    # Trier les lieux par score
    sorted_locations = sorted(location_scores.items(), key=lambda x: x[1]["score"], reverse=True)

    # Générer les recommandations
    recommendations = []

    # Date actuelle pour générer des recommandations futures
    current_date = datetime.now()

    # Jours de la semaine (lundi=0, dimanche=6)
    # Utiliser les jours préférés de l'utilisateur ou des jours par défaut
    if preferred_days:
        days_to_use = preferred_days
    else:
        days_to_use = [1, 2, 4]  # Mardi, Mercredi, Vendredi par défaut

    # Heures
    # Utiliser les heures préférées de l'utilisateur ou des heures par défaut
    if preferred_times:
        hours_to_use = preferred_times
    else:
        hours_to_use = [10, 14, 18]  # 10h, 14h, 18h par défaut

    for i in range(min(num_recommendations, len(sorted_locations))):
        # Sélectionner un jour
        day_idx = i % len(days_to_use)
        selected_day = days_to_use[day_idx]

        # Trouver le prochain jour de la semaine correspondant
        days_ahead = selected_day - current_date.weekday()
        if days_ahead < 0:
            days_ahead += 7

        # Sélectionner une heure
        hour_idx = i % len(hours_to_use)
        selected_hour = hours_to_use[hour_idx]

        next_date = current_date + timedelta(days=days_ahead)
        recommended_date = next_date.replace(hour=selected_hour, minute=0, second=0)

        # Sélectionner un lieu recommandé
        location_idx = i % len(sorted_locations)
        recommended_location, location_info = sorted_locations[location_idx]

        # Nombre attendu de participants (fictif)
        expected_participants = int(location_info["capacity"] * random.uniform(0.5, 0.9))

        # Créer la recommandation
        recommendation = {
            "date": recommended_date.strftime("%Y-%m-%dT%H:%M:%S"),
            "location": recommended_location,
            "expected_participants": expected_participants,
            "location_score": location_info["score"],
            "location_capacity": location_info["capacity"],
            "coordinates": {
                "lat": location_info["lat"],
                "lng": location_info["lng"]
            }
        }

        # Ajouter la distance si disponible
        if 'distance' in location_info:
            recommendation['distance'] = location_info['distance']

        recommendations.append(recommendation)

    return recommendations

@app.route('/api/predict', methods=['POST'])
def predict():
    """Endpoint pour la prédiction de catégorie (pour compatibilité avec l'ancien système)"""
    data = request.json
    title = data.get('title', '')

    # Logique simplifiée de prédiction de catégorie
    categories = ["Formation", "Conférence", "Atelier", "Meetup", "Hackathon"]

    # Logique basique basée sur des mots-clés
    if "formation" in title.lower() or "cours" in title.lower():
        prediction = "Formation"
    elif "conférence" in title.lower() or "présentation" in title.lower():
        prediction = "Conférence"
    elif "atelier" in title.lower() or "workshop" in title.lower():
        prediction = "Atelier"
    elif "meetup" in title.lower() or "rencontre" in title.lower():
        prediction = "Meetup"
    elif "hackathon" in title.lower() or "compétition" in title.lower():
        prediction = "Hackathon"
    else:
        # Prédiction aléatoire si aucun mot-clé ne correspond
        prediction = random.choice(categories)

    return jsonify({"prediction": prediction})

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Endpoint pour recommander des dates et lieux optimaux"""
    data = request.json
    num_recommendations = data.get('num_recommendations', 3)

    # Récupérer les préférences utilisateur (si fournies)
    user_preferences = data.get('user_preferences', {})
    user_location = user_preferences.get('location', {})
    preferred_days = user_preferences.get('preferred_days', [])
    preferred_times = user_preferences.get('preferred_times', [])
    max_distance = user_preferences.get('max_distance', 10)  # en km

    print(f"Préférences utilisateur reçues: {user_preferences}")

    # Générer les recommandations en tenant compte des préférences
    recommendations = generate_recommendations_with_preferences(
        num_recommendations,
        user_location,
        preferred_days,
        preferred_times,
        max_distance
    )

    return jsonify({
        "recommendations": recommendations
    })

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Endpoint pour obtenir tous les lieux disponibles avec leurs scores"""
    location_scores = calculate_location_scores()

    return jsonify({
        "locations": [
            {
                "name": location,
                "score": info["score"],
                "capacity": info["capacity"],
                "coordinates": {
                    "lat": info["lat"],
                    "lng": info["lng"]
                }
            }
            for location, info in location_scores.items()
        ]
    })

@app.route('/')
def home():
    """Page d'accueil avec documentation de l'API"""
    return render_template_string(HOME_PAGE_TEMPLATE)

@app.route('/api')
def api_info():
    """Information sur l'API au format JSON"""
    return jsonify({
        "name": "API d'Optimisation des Événements",
        "version": "1.0.0",
        "description": "API pour recommander des dates et lieux optimaux pour les événements",
        "endpoints": [
            {
                "path": "/api/predict",
                "method": "POST",
                "description": "Prédit la catégorie d'un événement"
            },
            {
                "path": "/api/recommend",
                "method": "POST",
                "description": "Recommande des dates et lieux optimaux"
            },
            {
                "path": "/api/locations",
                "method": "GET",
                "description": "Liste tous les lieux disponibles avec leurs scores"
            }
        ],
        "ui_url": "http://localhost:4200"
    })

if __name__ == '__main__':
    # Utiliser le port 5000 qui est généralement plus fiable
    port = 5000
    print(f"API Flask démarrée sur http://localhost:{port}")
    print(f"Accédez à http://localhost:{port} pour voir la documentation de l'API")

    # Désactiver le mode debug pour éviter les problèmes
    try:
        app.run(host='127.0.0.1', port=port, debug=False)
    except OSError as e:
        print(f"Erreur lors du démarrage de l'API sur le port {port}: {e}")
        # Essayer avec un autre port
        alt_port = 8080
        print(f"Tentative avec le port {alt_port}...")
        try:
            app.run(host='127.0.0.1', port=alt_port, debug=False)
            print(f"API Flask démarrée sur http://localhost:{alt_port}")
            print(f"IMPORTANT: Utilisez http://localhost:{alt_port} au lieu de http://localhost:{port}")
        except Exception as e2:
            print(f"Erreur lors du démarrage de l'API sur le port {alt_port}: {e2}")
            print("Impossible de démarrer l'API Flask. Veuillez vérifier qu'aucun autre service n'utilise les ports.")
            import sys
            sys.exit(1)
