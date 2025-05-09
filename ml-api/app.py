from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import joblib
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Créer le dossier models s'il n'existe pas
os.makedirs('models', exist_ok=True)

# Données fictives pour initialiser le modèle
# Dans un cas réel, ces données viendraient d'une base de données
sample_events = [
    {"eventId": 1, "title": "Workshop Python", "date": "2023-05-15T14:00:00", "location": "Salle A", "participants": 25},
    {"eventId": 2, "title": "Conférence IA", "date": "2023-05-16T10:00:00", "location": "Amphithéâtre", "participants": 120},
    {"eventId": 3, "title": "Hackathon", "date": "2023-05-17T09:00:00", "location": "Espace Co-working", "participants": 50},
    {"eventId": 4, "title": "Meetup Angular", "date": "2023-05-18T18:00:00", "location": "Salle B", "participants": 30},
    {"eventId": 5, "title": "Formation DevOps", "date": "2023-05-19T09:00:00", "location": "Salle C", "participants": 15},
    {"eventId": 6, "title": "Workshop Design", "date": "2023-05-15T10:00:00", "location": "Salle A", "participants": 20},
    {"eventId": 7, "title": "Conférence Web", "date": "2023-05-16T14:00:00", "location": "Amphithéâtre", "participants": 100},
    {"eventId": 8, "title": "Meetup React", "date": "2023-05-17T18:00:00", "location": "Salle B", "participants": 35},
    {"eventId": 9, "title": "Formation Cloud", "date": "2023-05-18T09:00:00", "location": "Salle C", "participants": 18},
    {"eventId": 10, "title": "Hackathon Mobile", "date": "2023-05-19T09:00:00", "location": "Espace Co-working", "participants": 45},
]

# Données de localisation fictives (coordonnées)
locations = {
    "Salle A": {"lat": 36.8065, "lng": 10.1815, "capacity": 30},
    "Salle B": {"lat": 36.8068, "lng": 10.1820, "capacity": 40},
    "Salle C": {"lat": 36.8070, "lng": 10.1825, "capacity": 25},
    "Amphithéâtre": {"lat": 36.8075, "lng": 10.1830, "capacity": 150},
    "Espace Co-working": {"lat": 36.8080, "lng": 10.1835, "capacity": 60},
    "Cafétéria": {"lat": 36.8085, "lng": 10.1840, "capacity": 80},
    "Bibliothèque": {"lat": 36.8090, "lng": 10.1845, "capacity": 50},
    "Jardin": {"lat": 36.8095, "lng": 10.1850, "capacity": 100},
}

# Densité d'utilisateurs par zone (fictif)
user_density = {
    "Zone Centre": {"lat": 36.8070, "lng": 10.1825, "density": 0.8},
    "Zone Nord": {"lat": 36.8090, "lng": 10.1835, "density": 0.6},
    "Zone Sud": {"lat": 36.8050, "lng": 10.1815, "density": 0.4},
    "Zone Est": {"lat": 36.8075, "lng": 10.1850, "density": 0.5},
    "Zone Ouest": {"lat": 36.8065, "lng": 10.1800, "density": 0.3},
}

def preprocess_events(events):
    """Prétraite les données d'événements pour le clustering"""
    df = pd.DataFrame(events)
    
    # Convertir les dates en format datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Extraire les caractéristiques temporelles
    df['hour'] = df['date'].dt.hour
    df['day_of_week'] = df['date'].dt.dayofweek
    
    # Ajouter les coordonnées de localisation
    df['lat'] = df['location'].apply(lambda x: locations.get(x, {"lat": 0})["lat"])
    df['lng'] = df['location'].apply(lambda x: locations.get(x, {"lng": 0})["lng"])
    
    return df

def train_clustering_model(df):
    """Entraîne un modèle de clustering K-Means sur les données d'événements"""
    # Sélectionner les caractéristiques pour le clustering
    features = df[['hour', 'day_of_week', 'participants', 'lat', 'lng']]
    
    # Normaliser les données
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # Déterminer le nombre optimal de clusters (simplifié ici)
    k = min(5, len(df))
    
    # Entraîner le modèle K-Means
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(scaled_features)
    
    # Sauvegarder le modèle et le scaler
    joblib.dump(kmeans, 'models/kmeans_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    # Ajouter les clusters aux données
    df['cluster'] = kmeans.labels_
    
    return df, kmeans, scaler

def calculate_location_scores(df):
    """Calcule un score pour chaque lieu en fonction des données historiques et de la densité d'utilisateurs"""
    location_scores = {}
    
    for location, info in locations.items():
        # Score basé sur la capacité
        capacity_score = min(info["capacity"] / 100, 1.0)
        
        # Score basé sur la popularité historique
        location_events = df[df['location'] == location]
        if len(location_events) > 0:
            avg_participants = location_events['participants'].mean()
            popularity_score = min(avg_participants / 50, 1.0)
        else:
            popularity_score = 0.5  # Score par défaut
        
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

def recommend_dates_and_locations(df, kmeans, scaler, num_recommendations=3):
    """Génère des recommandations de dates et lieux basées sur le clustering et les scores"""
    # Analyser les clusters pour trouver les meilleurs créneaux horaires
    cluster_stats = {}
    for cluster in range(kmeans.n_clusters):
        cluster_data = df[df['cluster'] == cluster]
        
        # Calculer les heures et jours moyens pour ce cluster
        avg_hour = round(cluster_data['hour'].mean())
        avg_day = int(round(cluster_data['day_of_week'].mean()))
        avg_participants = cluster_data['participants'].mean()
        
        cluster_stats[cluster] = {
            "avg_hour": avg_hour,
            "avg_day": avg_day,
            "avg_participants": avg_participants
        }
    
    # Trier les clusters par nombre moyen de participants (décroissant)
    sorted_clusters = sorted(cluster_stats.items(), key=lambda x: x[1]["avg_participants"], reverse=True)
    
    # Calculer les scores des lieux
    location_scores = calculate_location_scores(df)
    sorted_locations = sorted(location_scores.items(), key=lambda x: x[1]["score"], reverse=True)
    
    # Générer les recommandations
    recommendations = []
    
    # Date actuelle pour générer des recommandations futures
    current_date = datetime.now()
    
    for i in range(min(num_recommendations, len(sorted_clusters))):
        cluster_id, stats = sorted_clusters[i]
        
        # Trouver le prochain jour de la semaine correspondant
        days_ahead = stats["avg_day"] - current_date.weekday()
        if days_ahead < 0:
            days_ahead += 7
        
        next_date = current_date + timedelta(days=days_ahead)
        recommended_date = next_date.replace(hour=stats["avg_hour"], minute=0, second=0)
        
        # Sélectionner un lieu recommandé (différent pour chaque recommandation si possible)
        location_idx = i % len(sorted_locations)
        recommended_location, location_info = sorted_locations[location_idx]
        
        recommendations.append({
            "date": recommended_date.strftime("%Y-%m-%dT%H:%M:%S"),
            "location": recommended_location,
            "expected_participants": round(stats["avg_participants"]),
            "location_score": location_info["score"],
            "location_capacity": location_info["capacity"],
            "coordinates": {
                "lat": location_info["lat"],
                "lng": location_info["lng"]
            }
        })
    
    return recommendations

# Initialiser et entraîner le modèle au démarrage
df = preprocess_events(sample_events)
df, kmeans_model, scaler = train_clustering_model(df)

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
        prediction = np.random.choice(categories)
    
    return jsonify({"prediction": prediction})

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Endpoint pour recommander des dates et lieux optimaux"""
    data = request.json
    num_recommendations = data.get('num_recommendations', 3)
    
    # Charger les modèles entraînés
    try:
        kmeans_model = joblib.load('models/kmeans_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
    except:
        # Si les modèles n'existent pas, utiliser les modèles globaux
        pass
    
    # Générer les recommandations
    recommendations = recommend_dates_and_locations(df, kmeans_model, scaler, num_recommendations)
    
    return jsonify({
        "recommendations": recommendations
    })

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Endpoint pour obtenir tous les lieux disponibles avec leurs scores"""
    location_scores = calculate_location_scores(df)
    
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8089, debug=True)
