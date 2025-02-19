# 📖 Documentation de l'API

## 🚀 Introduction

Cette API permet la gestion des utilisateurs, de leur authentification et des relations d'amitié. Elle utilise des tokens JWT pour sécuriser les accès aux différentes routes.

---

## 🛣️ Routes

### 💂 Création d'un utilisateur

#### `POST /api/create-user/`

Permet de créer un nouvel utilisateur API, ce qui génère des identifiants pour l'authentification.

📌 **Exemple de requête :**

```json
{
  "username": "pepe",
  "password": "pepe"
}
```

---

### 🔐 Authentification

#### `POST /api-token-auth/`

Génère un token JWT permettant l'authentification auprès de l'API et de toutes ses routes.

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
  "password": "test"
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

