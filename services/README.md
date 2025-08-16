# 📖 Documentation de l'API

## COMMENT INSTALLER NPM

	Prerequis
```bash
sudo apt-get install -y nodejs
sudo apt install -y npm
```

	1. In api folder run theses commands 
```
npm init -y
npm i fastify
npm i -D typescript @types/node
```

	2. Add the following lines to the "scripts" section of the package.json:
```
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node index.js"
  }
```

## 🚀 Introduction

Cette API permet la gestion des utilisateurs, de leur authentification et des relations d'amitié. Elle utilise des tokens JWT pour sécuriser les accès aux différentes routes.

---

## 🛣️ Routes

---

### 🔐 Authentification

#### `GET /auth/redirect`

Génère une url de connexion oauth2 avec google et redirige vers le callback.

📌 **Exemple de requête :**

```json
{
  "username": "pepe",
  "password": "pepe"
}
```

⚠️ L'utilisateur doit avoir été créé au préalable via [`/api/create-user/`](#-creation-dun-utilisateur).

---

### 🧑‍🚀 Gestion des utilisateurs

#### `GET /api/user/`

Récupère la liste des utilisateurs enregistrés.

#### `POST /api/user/`

Crée un nouvel utilisateur et génère un JWT qui est renvoyé dans les cookies.

📌 **Exemple de requête :**

```json
{
  "username": "madamou",
  "profile_picture": "upload/profile/madamou.png",
  "password": "test123"
}
```

---

### 🧑‍🔧 Profil utilisateur

#### `GET /api/me/`

Retourne les informations de l'utilisateur actuellement connecté.

⚠️ Le JWT doit être fourni dans les cookies de la requête.

#### `DELETE /api/me/`

supprime toutes les informations de l'utilisateur actuellement connecté.

⚠️ Le JWT doit être fourni dans les cookies de la requête.

---

### ➕ Gestion des amis

#### `POST /api/friends/`

Ajoute un utilisateur à la liste d'amis de l'utilisateur connecté.

📌 **Exemple de requête :**

```json
{
  "username": "madamou"
}
```

#### `DELETE /api/friends/`

Retire un utilisateur de la liste d'amis de l'utilisateur connecté.

📌 **Exemple de requête :**

```json
{
  "username": "madamou"
}
```

⚠️ Le JWT doit être fourni dans les cookies de la requête.

---

## 🛠️ Remarques

- Toutes les requêtes nécessitant une authentification doivent inclure un JWT valide dans les cookies.
- Assurez-vous d'utiliser des mots de passe sécurisés lors de la création d'un utilisateur.
- L'API suit les bonnes pratiques RESTful pour la gestion des ressources.

📌 **Bon développement !** 🚀

