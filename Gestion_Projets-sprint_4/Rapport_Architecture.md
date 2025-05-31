# Rapport d'Architecture - Système de Gestion de Projets Académiques

## 1. Vue d'ensemble

Ce système de gestion de projets académiques est conçu pour faciliter la coordination entre étudiants, enseignants, administrateurs et entreprises dans le cadre de projets académiques. L'application suit une architecture client-serveur avec une séparation claire entre le frontend et le backend.

## 2. Architecture Technique

### 2.1 Architecture Globale

L'application suit le modèle d'architecture **MVC (Modèle-Vue-Contrôleur)** avec une séparation claire des responsabilités :

- **Modèle** : Gestion des données via Prisma ORM et PostgreSQL
- **Vue** : Interface utilisateur développée avec React
- **Contrôleur** : Logique métier implémentée dans des contrôleurs Express.js

### 2.2 Stack Technologique

#### Backend
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express.js** : Framework web pour la création d'API RESTful
- **Prisma ORM** : ORM moderne pour l'interaction avec la base de données
- **PostgreSQL** : Système de gestion de base de données relationnelle
- **JWT** : Authentification basée sur les tokens
- **Multer** : Middleware pour la gestion des téléchargements de fichiers
- **Nodemailer** : Service d'envoi d'emails
- **PDFKit** : Génération de documents PDF

#### Frontend
- **React** : Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **React Router** : Gestion du routage côté client
- **Axios** : Client HTTP pour les requêtes API
- **Framer Motion** : Bibliothèque d'animations

## 3. Structure du Projet

### 3.1 Organisation des Dossiers

```
Gestion_Projets/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── outilles/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   ├── uploads/
│   ├── uploads-img/
│   ├── uploads-livrables/
│   ├── uploads-pv/
│   ├── utils/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
└── package.json
```

### 3.2 Composants Principaux

#### Backend

- **Controllers** : Contiennent la logique métier pour chaque entité (projets, équipes, utilisateurs, etc.)
- **Middleware** : Fonctions intermédiaires pour l'authentification, la validation et le contrôle d'accès
- **Routes** : Définition des points d'entrée API
- **Prisma** : Modèles de données et migrations
- **Outilles** : Utilitaires comme l'envoi d'emails et la gestion des fichiers

#### Frontend

- **Pages** : Composants React pour chaque page de l'application
- **Components** : Composants réutilisables
- **API** : Services pour communiquer avec le backend

## 4. Modèle de Données

### 4.1 Entités Principales

- **Etudiant** : Utilisateurs étudiants pouvant former des équipes
- **Enseignant** : Encadrants et membres de jury
- **Admin** : Administrateurs du système
- **Entreprise** : Partenaires externes proposant des sujets
- **Equipe** : Groupes d'étudiants travaillant sur un projet
- **Sujet** : Propositions de projets
- **Projet** : Association entre une équipe et un sujet avec un encadrant
- **Soutenance** : Évaluation finale d'un projet
- **Livrable** : Documents soumis par les équipes
- **RendezVous** : Réunions planifiées entre équipes et encadrants
- **Remarque** : Commentaires des encadrants sur le travail
- **Task** : Tâches assignées aux équipes

### 4.2 Relations Clés

- Une **Equipe** est composée de plusieurs **Etudiants**
- Un **Projet** est associé à une **Equipe**, un **Sujet** et un **Enseignant** (encadrant)
- Une **Soutenance** est liée à une **Equipe** et plusieurs **Enseignants** (jury)
- Un **Sujet** peut être proposé par un **Enseignant** ou une **Entreprise**

## 5. Flux d'Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :

1. L'utilisateur se connecte via l'endpoint de login
2. Le serveur vérifie les identifiants et génère un token JWT
3. Le token est stocké dans un cookie côté client
4. Le middleware `authenticateToken` vérifie la validité du token pour chaque requête protégée
5. Les middlewares spécifiques (`isAdmin`, `isStudent`, `isLeader`, etc.) contrôlent les autorisations

## 6. Points d'API Principaux

### 6.1 Gestion des Utilisateurs
- Routes d'authentification (login, logout)
- Gestion des profils utilisateurs

### 6.2 Gestion des Équipes
- Création et modification d'équipes
- Gestion des invitations entre étudiants
- Transfert de leadership

### 6.3 Gestion des Projets
- Soumission et affectation de sujets
- Suivi de l'avancement des projets
- Gestion des livrables et des tâches

### 6.4 Gestion des Soutenances
- Planification des soutenances
- Évaluation et génération de PV

## 7. Sécurité

- **Authentification** : Basée sur JWT avec expiration des tokens
- **Hachage des mots de passe** : Utilisation de bcrypt
- **Contrôle d'accès** : Middlewares spécifiques pour vérifier les rôles et permissions
- **Validation des données** : Vérification des entrées utilisateur

## 8. Gestion des Fichiers

L'application gère plusieurs types de fichiers :
- Images de profil (uploads-img)
- Livrables de projets (uploads-livrables)
- Procès-verbaux de soutenance (uploads-pv)
- Fichiers temporaires (uploads)

Le middleware Multer est utilisé pour gérer les téléchargements de fichiers.

## 9. Conclusion

Cette application de gestion de projets académiques présente une architecture robuste et modulaire, permettant une séparation claire des responsabilités. L'utilisation de technologies modernes comme React, Express.js et Prisma ORM facilite le développement et la maintenance du système.

La structure du projet permet une évolution facile avec l'ajout de nouvelles fonctionnalités, tout en maintenant une base de code organisée et maintenable.