@echo off
echo ===================================================
echo Configuration de l'environnement Python
echo ===================================================

echo.
echo 1. Mise a jour de pip...
python -m pip install --upgrade pip

echo.
echo 2. Installation de setuptools...
python -m pip install --upgrade setuptools wheel

echo.
echo 3. Installation des dependances Python...
cd ml-api
python -m pip install flask flask-cors numpy pandas scikit-learn joblib

echo.
echo Configuration terminee avec succes!
echo.
pause
