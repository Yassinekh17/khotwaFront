import requests
import time
import sys

def test_api(port):
    """Test if the API is accessible on the given port"""
    url = f"http://localhost:{port}"
    try:
        response = requests.get(url, timeout=5)
        print(f"API accessible sur {url}")
        print(f"Status code: {response.status_code}")
        print(f"Contenu: {response.text[:100]}...")  # Afficher les 100 premiers caractères
        return True
    except Exception as e:
        print(f"Erreur lors de l'accès à {url}: {e}")
        return False

def test_api_endpoints(port):
    """Test the API endpoints"""
    base_url = f"http://localhost:{port}/api"
    
    # Test /api/locations
    try:
        response = requests.get(f"{base_url}/locations", timeout=5)
        print(f"\nTest de /api/locations:")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Nombre de lieux: {len(data.get('locations', []))}")
    except Exception as e:
        print(f"Erreur lors de l'accès à /api/locations: {e}")
    
    # Test /api/predict
    try:
        response = requests.post(
            f"{base_url}/predict",
            json={"title": "Workshop Python"},
            timeout=5
        )
        print(f"\nTest de /api/predict:")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Prédiction: {data}")
    except Exception as e:
        print(f"Erreur lors de l'accès à /api/predict: {e}")
    
    # Test /api/recommend
    try:
        response = requests.post(
            f"{base_url}/recommend",
            json={"num_recommendations": 2},
            timeout=5
        )
        print(f"\nTest de /api/recommend:")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Nombre de recommandations: {len(data.get('recommendations', []))}")
    except Exception as e:
        print(f"Erreur lors de l'accès à /api/recommend: {e}")

if __name__ == "__main__":
    print("Test de l'API Flask...")
    
    # Ports à tester
    ports = [5000, 8080, 8090]
    
    for port in ports:
        print(f"\nTest du port {port}...")
        if test_api(port):
            print(f"API trouvée sur le port {port}")
            test_api_endpoints(port)
            sys.exit(0)
    
    print("\nAucune API trouvée sur les ports testés.")
    print("Veuillez démarrer l'API avec start_api_simple.bat")
    sys.exit(1)
