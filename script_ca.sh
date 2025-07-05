#!/bin/bash

CA_DIR="./ca"
CA_KEY="$CA_DIR/myCA.key"
CA_CERT="$CA_DIR/myCA.pem"

# Liste des services
INTERFACE=("frontend" "gateway")

SERVICES=("auth" "user" "media" "game" "chat")

# Création du CA s'il n'existe pas
if [ ! -f "$CA_KEY" ]; then
  echo "🚀 Création du CA interne..."
  mkdir -p "$CA_DIR"
  openssl genrsa -out "$CA_KEY" 4096
  openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 -out "$CA_CERT" \
    -subj "/C=FR/ST=Paris/L=Paris/O=MyCompany/OU=IT/CN=My Internal CA"
fi

for SERVICE in "${INTERFACE[@]}"; do
  echo "🔧 Création du certificat pour l'interface $SERVICE ..."
  # Création du répertoire pour le service s'il n'existe pas
  mkdir -p "./$SERVICE/ssl"
  openssl genrsa -out "./$SERVICE/ssl/$SERVICE.key" 2048
  openssl req -new -key "./$SERVICE/ssl/$SERVICE.key" -out "./$SERVICE/ssl/$SERVICE.csr" \
	-subj "/C=FR/ST=Paris/L=Paris/O=MyCompany/OU=IT/CN=localhost"
  openssl x509 -req -in "./$SERVICE/ssl/$SERVICE.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
	-CAcreateserial -out "./$SERVICE/ssl/$SERVICE.crt" -days 825 -sha256
	cp -r $CA_CERT "./$SERVICE/ssl/ca.pem"
  echo "✅ Certificat pour l'interface $SERVICE créé avec succès."
done

# Génération des certificats pour chaque service
for SERVICE in "${SERVICES[@]}"; do
  echo "🔧 Création du certificat pour $SERVICE ..."
  mkdir -p "./services/$SERVICE/ssl"
  openssl genrsa -out "./services/$SERVICE/ssl/$SERVICE.key" 2048
  openssl req -new -key "./services/$SERVICE/ssl/$SERVICE.key" -out "./services/$SERVICE/ssl/$SERVICE.csr" \
    -subj "/C=FR/ST=Paris/L=Paris/O=MyCompany/OU=IT/CN=$SERVICE"
  openssl x509 -req -in "./services/$SERVICE/ssl/$SERVICE.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
    -CAcreateserial -out "./services/$SERVICE/ssl/$SERVICE.crt" -days 825 -sha256
	  cp -r $CA_CERT "./services/$SERVICE/ssl/ca.pem"
	    echo "✅ Certificat pour $SERVICE créé avec succès."
done

echo "✅ Tous les certificats ont été créés."
