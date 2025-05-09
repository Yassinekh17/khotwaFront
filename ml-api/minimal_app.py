from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Données fictives pour les lieux
locations = {
    "Salle A": {"lat": 36.8065, "lng": 10.1815, "capacity": 30},
    "Salle B": {"lat": 36.8068, "lng": 10.1820, "capacity": 40},
    "Salle C": {"lat": 36.8070, "lng": 10.1825, "capacity": 25},
    "Amphithéâtre": {"lat": 36.8075, "lng": 10.1830, "capacity": 150},
    "Espace Co-working": {"lat": 36.8080, "lng": 10.1835, "capacity": 60},
}

@app.route('/')
def home():
    """Page d'accueil simple"""
    return """
    <html>
        <head>
            <title>API de Recommandation</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #2c5282; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>API de Recommandation</h1>
            <p>API fonctionnelle! Endpoints disponibles:</p>
            <ul>
                <li><a href="/api/locations">/api/locations</a> (GET)</li>
                <li>/api/predict (POST)</li>
                <li>/api/recommend (POST)</li>
            </ul>
        </body>
    </html>
    """

@app.route('/api/locations')
def get_locations():
    """Endpoint pour obtenir tous les lieux disponibles"""
    location_list = [
        {
            "name": location,
            "score": round(random.uniform(0.5, 0.9), 2),
            "capacity": info["capacity"],
            "coordinates": {
                "lat": info["lat"],
                "lng": info["lng"]
            }
        }
        for location, info in locations.items()
    ]
    
    return jsonify({
        "locations": location_list
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Endpoint pour la prédiction de catégorie"""
    data = request.json
    title = data.get('title', '')
    
    # Logique simplifiée de prédiction
    categories = ["Formation", "Conférence", "Atelier", "Meetup", "Hackathon"]
    prediction = random.choice(categories)
    
    return jsonify({"prediction": prediction})

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Endpoint pour recommander des dates et lieux optimaux"""
    data = request.json
    num_recommendations = data.get('num_recommendations', 3)
    user_preferences = data.get('user_preferences', {})
    
    # Générer des recommandations simples
    recommendations = []
    current_date = datetime.now()
    
    for i in range(min(num_recommendations, len(locations))):
        # Sélectionner un lieu
        location_name = list(locations.keys())[i % len(locations)]
        location_info = locations[location_name]
        
        # Générer une date (dans les 7 prochains jours)
        days_ahead = random.randint(1, 7)
        hours = random.choice([9, 10, 14, 16, 18])
        recommended_date = current_date + timedelta(days=days_ahead)
        recommended_date = recommended_date.replace(hour=hours, minute=0, second=0)
        
        # Générer un score et des participants attendus
        score = round(random.uniform(0.5, 0.9), 2)
        expected_participants = int(location_info["capacity"] * random.uniform(0.5, 0.9))
        
        # Ajouter la distance si l'utilisateur a fourni sa localisation
        distance = None
        if user_preferences and 'location' in user_preferences:
            user_loc = user_preferences['location']
            if 'lat' in user_loc and 'lng' in user_loc:
                # Calcul simplifié de la distance (en km)
                distance = round(random.uniform(1, 10), 1)
        
        # Créer la recommandation
        recommendation = {
            "date": recommended_date.strftime("%Y-%m-%dT%H:%M:%S"),
            "location": location_name,
            "expected_participants": expected_participants,
            "location_score": score,
            "location_capacity": location_info["capacity"],
            "coordinates": {
                "lat": location_info["lat"],
                "lng": location_info["lng"]
            }
        }
        
        # Ajouter la distance si disponible
        if distance is not None:
            recommendation["distance"] = distance
        
        recommendations.append(recommendation)
    
    return jsonify({
        "recommendations": recommendations
    })

if __name__ == '__main__':
    port = 5000
    print(f"API Flask démarrée sur http://localhost:{port}")
    print(f"Accédez à http://localhost:{port} pour vérifier que l'API fonctionne")
    
    try:
        app.run(host='127.0.0.1', port=port)
    except Exception as e:
        print(f"Erreur: {e}")
        print("Tentative avec le port 8080...")
        try:
            app.run(host='127.0.0.1', port=8080)
        except Exception as e:
            print(f"Erreur: {e}")
            print("Impossible de démarrer l'API Flask.")
