@echo off
echo ===================================================
echo Test de l'API d'Optimisation des Evenements
echo ===================================================

echo.
echo 1. Recherche de l'API sur les ports disponibles...
powershell -Command "
$ports = @(8090, 8089, 5000)
$apiFound = $false
$apiPort = 0

foreach ($port in $ports) {
    try {
        Write-Host \"Tentative sur le port $port...\" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri \"http://localhost:$port\" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host \"API accessible sur le port $port!\" -ForegroundColor Green
            $apiFound = $true
            $apiPort = $port
            break
        }
    } catch {
        Write-Host \"API non accessible sur le port $port\" -ForegroundColor Red
    }
}

if (-not $apiFound) {
    Write-Host \"API non accessible sur aucun port. Demarrez-la avec .\start_ml_api.bat\" -ForegroundColor Red
    exit 1
}

# Définir la variable pour les tests suivants
\$env:API_PORT = $apiPort
"

echo.
echo 2. Test de l'endpoint /api/locations...
powershell -Command "try { $response = Invoke-WebRequest -Uri \"http://localhost:$env:API_PORT/api/locations\" -UseBasicParsing; $content = $response.Content | ConvertFrom-Json; Write-Host ('Nombre de lieux disponibles: ' + $content.locations.Count) -ForegroundColor Green; Write-Host 'Premier lieu:' -ForegroundColor Yellow; $content.locations[0] | ConvertTo-Json } catch { Write-Host 'Erreur lors du test de /api/locations' -ForegroundColor Red; exit 1 }"

echo.
echo 3. Test de l'endpoint /api/predict...
powershell -Command "try { $body = @{title='Workshop Python'} | ConvertTo-Json; $response = Invoke-WebRequest -Uri \"http://localhost:$env:API_PORT/api/predict\" -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; $content = $response.Content | ConvertFrom-Json; Write-Host ('Prediction: ' + $content.prediction) -ForegroundColor Green } catch { Write-Host 'Erreur lors du test de /api/predict' -ForegroundColor Red; exit 1 }"

echo.
echo 4. Test de l'endpoint /api/recommend...
powershell -Command "try { $body = @{num_recommendations=2} | ConvertTo-Json; $response = Invoke-WebRequest -Uri \"http://localhost:$env:API_PORT/api/recommend\" -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; $content = $response.Content | ConvertFrom-Json; Write-Host ('Nombre de recommandations: ' + $content.recommendations.Count) -ForegroundColor Green; Write-Host 'Premiere recommandation:' -ForegroundColor Yellow; $content.recommendations[0] | ConvertTo-Json } catch { Write-Host 'Erreur lors du test de /api/recommend' -ForegroundColor Red; exit 1 }"

echo.
echo ===================================================
echo Tous les tests ont reussi!
echo ===================================================
echo.
echo Pour utiliser l'interface utilisateur:
echo 1. Accedez a http://localhost:4200
echo 2. Cliquez sur "Recommandations IA" dans la barre de navigation
echo 3. Entrez le nombre de recommandations souhaite (1-10)
echo 4. Cliquez sur "Generer des recommandations"
echo.
echo Pour plus d'informations, consultez GUIDE_UTILISATION.md
echo.
pause
