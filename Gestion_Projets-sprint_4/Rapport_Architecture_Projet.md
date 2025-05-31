# RAPPORT D'ARCHITECTURE - SYSTÈME DE GESTION DE PROJET

## TABLE DES MATIÈRES

1. [INTRODUCTION](#1-introduction)
   1. [C'est quoi?](#11-cest-quoi)
   2. [Pourquoi?](#12-pourquoi)
   3. [Il y'a quoi dans ce rapport?](#13-il-ya-quoi-dans-ce-rapport)
2. [ARCHITECTURE GLOBALE](#2-architecture-globale)
   1. [Les Acteurs Du Système](#21-les-acteurs-du-système)
   2. [Le Schéma Global](#22-le-schéma-global)
3. [SCHÉMA DÉTAILLÉ DE CHAQUE MODULE](#3-schéma-détaillé-de-chaque-module)
   1. [Gestion des comptes et des rôles](#31-gestion-des-comptes-et-des-rôles)
   2. [Gestion des entrées](#32-gestion-des-entrées)
   3. [Gestion des sorties](#33-gestion-des-sorties)
   4. [Gestion de projet et les statistiques](#34-gestion-de-projet-et-les-statistiques)
4. [ARCHITECTURE UTILISÉE](#4-architecture-utilisée)
5. [DIAGRAMME DE DÉPLOIEMENT](#5-diagramme-de-déploiement)
6. [DIAGRAMME DE COMPOSANTS](#6-diagramme-de-composants)
7. [CONCLUSION](#7-conclusion)

## 1. INTRODUCTION

### 1.1 C'est quoi?

Le Système de Gestion de Projet est une application complète conçue pour planifier, exécuter, suivre et clôturer des projets au sein d'une organisation. Cette solution logicielle permet de gérer efficacement les ressources, les tâches, les délais et les budgets, tout en facilitant la collaboration entre les membres de l'équipe et en fournissant des tableaux de bord et des rapports détaillés pour faciliter la prise de décision.

### 1.2 Pourquoi?

La mise en place d'un système de gestion de projet répond à plusieurs besoins critiques :

- **Centralisation de l'information** : Regrouper toutes les données et documents liés aux projets en un seul endroit
- **Planification efficace** : Structurer les projets en phases, jalons et tâches avec des échéances claires
- **Allocation optimale des ressources** : Attribuer les bonnes ressources aux bonnes tâches au bon moment
- **Suivi en temps réel** : Surveiller l'avancement des projets et identifier rapidement les écarts
- **Collaboration améliorée** : Faciliter la communication et le partage d'informations entre les membres de l'équipe
- **Gestion des risques** : Identifier, évaluer et atténuer les risques potentiels
- **Prise de décision éclairée** : Fournir des données précises et des indicateurs de performance pour guider les décisions

### 1.3 Il y'a quoi dans ce rapport?

Ce rapport d'architecture présente une vue complète du système de gestion de projet, incluant :

- Une description de l'architecture globale et des acteurs du système
- Les schémas détaillés de chaque module fonctionnel
- L'architecture technique utilisée (patterns, frameworks, etc.)
- Les diagrammes de déploiement illustrant l'infrastructure technique
- Les diagrammes de composants montrant les interactions entre les différentes parties du système
- Une conclusion résumant les points forts de l'architecture et ses perspectives d'évolution

## 2. ARCHITECTURE GLOBALE

### 2.1 Les Acteurs Du Système

Le système interagit avec plusieurs types d'utilisateurs, chacun ayant des rôles et des responsabilités spécifiques :

- **Administrateur** : Dispose d'un accès complet au système, gère les utilisateurs et leurs droits, configure les paramètres globaux et supervise l'ensemble des opérations.

- **Chef de Projet** : Responsable de la planification, de l'exécution et de la clôture des projets. Il définit les objectifs, alloue les ressources, suit l'avancement et prend les décisions stratégiques.

- **Membre d'Équipe** : Exécute les tâches assignées, met à jour leur statut d'avancement, collabore avec les autres membres et signale les problèmes rencontrés.

- **Partie Prenante** : Consulte l'état d'avancement des projets, valide les livrables et fournit des retours sans pouvoir modifier directement les données du projet.

- **Responsable Ressources** : Gère la disponibilité et l'allocation des ressources humaines et matérielles aux différents projets.

- **Système externe** : Autres applications ou services qui peuvent interagir avec le système via des API (systèmes CRM, ERP, outils de comptabilité, etc.).

### 2.2 Le Schéma Global

L'architecture globale du système suit un modèle en couches avec une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE UTILISATEUR                     │
│  (Applications Web, Mobile, Tableaux de bord, Notifications) │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      COUCHE MÉTIER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Gestion des │  │ Gestion des │  │ Gestion des │          │
│  │  Comptes    │  │   Projets   │  │   Tâches    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Gestion des │  │ Statistiques│  │ Alertes et  │          │
│  │ Ressources  │  │ et Rapports │  │Notifications│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     COUCHE D'ACCÈS                           │
│  (ORM, Services de données, Cache, Gestion des transactions) │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    COUCHE DE DONNÉES                         │
│        (Base de données relationnelle, Stockage fichiers)    │
└─────────────────────────────────────────────────────────────┘
```

Cette architecture permet :

- Une **séparation claire des responsabilités** entre les différentes couches
- Une **maintenance facilitée** grâce à la modularité du système
- Une **évolutivité optimale** permettant d'ajouter de nouvelles fonctionnalités sans impacter l'existant
- Une **sécurité renforcée** avec des contrôles d'accès à chaque niveau

## 3. SCHÉMA DÉTAILLÉ DE CHAQUE MODULE

### 3.1 Gestion des comptes et des rôles

Ce module gère l'authentification, l'autorisation et l'administration des utilisateurs du système.

**Fonctionnalités principales :**

- **Authentification** : Gestion des connexions sécurisées (login/logout)
- **Gestion des profils** : Création, modification et désactivation des comptes utilisateurs
- **Gestion des rôles** : Attribution et modification des droits d'accès
- **Audit des actions** : Journalisation des activités des utilisateurs

**Schéma du module :**

```
┌─────────────────────────────────────────────────────────────┐
│                 MODULE GESTION DES COMPTES                   │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Service     │    │ Service     │    │ Service     │      │
│  │ Authentifi- │◄──►│ Gestion des │◄──►│ Gestion des │      │
│  │ cation      │    │ Utilisateurs│    │ Rôles       │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│          ▲                  ▲                  ▲             │
│          │                  │                  │             │
│          ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Contrôleur  │    │ Contrôleur  │    │ Contrôleur  │      │
│  │ Auth        │    │ Utilisateurs│    │ Rôles       │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interactions avec les autres modules :**
- Fournit des services d'authentification et d'autorisation à tous les autres modules
- Communique avec le module de notifications pour les alertes liées aux comptes

### 3.2 Gestion des entrées

Ce module gère tous les flux entrants dans le système de gestion de projet, notamment la création et la planification des projets.

**Fonctionnalités principales :**

- **Création de projets** : Définition des objectifs, périmètre et contraintes
- **Planification** : Découpage en phases, jalons et tâches
- **Allocation des ressources** : Attribution des ressources humaines et matérielles
- **Gestion des budgets** : Définition et suivi des budgets prévisionnels
- **Gestion des documents** : Stockage et versionnage des documents liés aux projets

**Schéma du module :**

```
┌─────────────────────────────────────────────────────────────┐
│                 MODULE GESTION DES ENTRÉES                   │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Service     │    │ Service     │    │ Service     │      │
│  │ Création    │◄──►│ Planifi-    │◄──►│ Allocation  │      │
│  │ Projets     │    │ cation      │    │ Ressources  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│          ▲                  ▲                  ▲             │
│          │                  │                  │             │
│          ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Contrôleur  │    │ Contrôleur  │    │ Contrôleur  │      │
│  │ Projets     │    │ Planning    │    │ Ressources  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interactions avec les autres modules :**
- Communique avec le module de gestion de projet pour mettre à jour l'état des projets
- Interagit avec le module de statistiques pour les rapports de planification
- Utilise le module de comptes pour la vérification des autorisations

### 3.3 Gestion des sorties

Ce module gère tous les flux sortants du système, notamment le suivi de l'exécution et la production de livrables.

**Fonctionnalités principales :**

- **Suivi d'avancement** : Mise à jour de l'état des tâches et des jalons
- **Gestion des livrables** : Production et validation des livrables du projet
- **Gestion des problèmes** : Identification et résolution des obstacles
- **Rapports d'avancement** : Génération de rapports périodiques
- **Gestion des changements** : Traitement des demandes de modification

**Schéma du module :**

```
┌─────────────────────────────────────────────────────────────┐
│                 MODULE GESTION DES SORTIES                   │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Service     │    │ Service     │    │ Service     │      │
│  │ Suivi       │◄──►│ Gestion des │◄──►│ Gestion des │      │
│  │ Avancement  │    │ Livrables   │    │ Problèmes   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│          ▲                  ▲                  ▲             │
│          │                  │                  │             │
│          ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Contrôleur  │    │ Contrôleur  │    │ Contrôleur  │      │
│  │ Avancement  │    │ Livrables   │    │ Problèmes   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interactions avec les autres modules :**
- Communique avec le module de gestion de projet pour mettre à jour l'état des projets
- Interagit avec le module de statistiques pour les rapports d'avancement
- Utilise le module de comptes pour la vérification des autorisations

### 3.4 Gestion de projet et les statistiques

Ce module constitue le cœur du système, gérant l'état des projets et fournissant des analyses statistiques.

**Fonctionnalités principales :**

- **Tableau de bord** : Vue synthétique de l'état des projets
- **Indicateurs de performance** : Calcul et affichage des KPIs (SPI, CPI, etc.)
- **Gestion des risques** : Identification, évaluation et suivi des risques
- **Rapports statistiques** : Analyses de performance, utilisation des ressources, etc.
- **Prévisions** : Estimation des tendances futures basée sur les données historiques

**Schéma du module :**

```
┌─────────────────────────────────────────────────────────────┐
│           MODULE GESTION DE PROJET ET STATISTIQUES           │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Service     │    │ Service     │    │ Service     │      │
│  │ Tableau de  │◄──►│ Indicateurs │◄──►│ Gestion des │      │
│  │ Bord        │    │ Performance │    │ Risques     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│          ▲                  ▲                  ▲             │
│          │                  │                  │             │
│          ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Service     │    │ Service     │    │ Service     │      │
│  │ Rapports    │◄──►│ Analyses    │◄──►│ Prévisions  │      │
│  │ Statistiques│    │ Tendances   │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interactions avec les autres modules :**
- Reçoit des mises à jour des modules d'entrées et de sorties
- Fournit des données aux interfaces utilisateur pour l'affichage des tableaux de bord
- Alimente le système de notifications pour les alertes liées aux projets

## 4. ARCHITECTURE UTILISÉE

Le système de gestion de projet est basé sur une architecture moderne et robuste, combinant plusieurs patterns et technologies :

### Patterns d'architecture

- **Architecture MVC (Modèle-Vue-Contrôleur)** : Séparation claire entre les données, la logique métier et l'interface utilisateur
- **Architecture en microservices** : Décomposition du système en services indépendants et spécialisés
- **Pattern Repository** : Abstraction de la couche d'accès aux données
- **Pattern Factory** : Création d'objets complexes sans exposer leur logique de création
- **Pattern Observer** : Notification des composants lors de changements d'état (utilisé pour les alertes)

### Stack technologique

#### Backend
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express.js** : Framework web pour la création d'API RESTful
- **Prisma ORM** : ORM moderne pour l'interaction avec la base de données
- **PostgreSQL** : Système de gestion de base de données relationnelle
- **Redis** : Stockage en mémoire pour le cache et les sessions
- **JWT** : Authentification basée sur les tokens
- **Socket.IO** : Communication en temps réel pour les notifications

#### Frontend
- **React** : Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **Redux** : Gestion de l'état global de l'application
- **Material-UI** : Framework de composants UI
- **Chart.js** : Bibliothèque de visualisation de données
- **Axios** : Client HTTP pour les requêtes API

#### DevOps & Infrastructure
- **Docker** : Conteneurisation des services
- **Kubernetes** : Orchestration des conteneurs
- **CI/CD** : Intégration et déploiement continus avec GitHub Actions
- **AWS/Azure** : Services cloud pour l'hébergement
- **Prometheus & Grafana** : Monitoring et alerting

## 5. DIAGRAMME DE DÉPLOIEMENT

Le diagramme de déploiement illustre l'infrastructure technique sur laquelle le système est déployé :

```
┌─────────────────────────────────────────────────────────────┐
│                     ENVIRONNEMENT CLOUD                      │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │             │    │             │    │             │      │
│  │  Load       │    │  Cluster    │    │  Services   │      │
│  │  Balancer   │───►│  Kubernetes │───►│  Managés    │      │
│  │             │    │             │    │  (DB, Cache)│      │
│  │             │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │             │    │             │    │             │      │
│  │  Stockage   │    │  Monitoring │    │  Backup &   │      │
│  │  Fichiers   │    │  & Logging  │    │  Disaster   │      │
│  │  (S3/Blob)  │    │             │    │  Recovery   │      │
│  │             │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

Cette architecture de déploiement offre :

- **Haute disponibilité** : Répartition de charge et redondance des composants
- **Scalabilité** : Capacité à augmenter les ressources en fonction de la demande
- **Résilience** : Mécanismes de reprise après incident
- **Sécurité** : Isolation des composants et gestion des accès
- **Observabilité** : Surveillance complète du système

## 6. DIAGRAMME DE COMPOSANTS

Le diagramme de composants montre les interactions entre les différentes parties du système :

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Applications │     │    API        │     │  Services      │
│  Clientes     │◄───►│  Gateway      │◄───►│  Métier        │
└───────────────┘     └───────────────┘     └───────┬───────┘
                                                     │
                                                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Services     │     │  Services     │     │  Services     │
│  Externes     │◄───►│  Intégration  │◄───►│  Données      │
└───────────────┘     └───────────────┘     └───────┬───────┘
                                                     │
                                                     ▼
                                            ┌───────────────┐
                                            │  Base de      │
                                            │  Données      │
                                            └───────────────┘
```

Ce diagramme illustre :

- La **séparation des responsabilités** entre les différents composants
- Les **flux de communication** entre les composants
- L'**intégration** avec des services externes
- La **centralisation** de l'accès aux données

## 7. CONCLUSION

L'architecture proposée pour le système de gestion de projet offre une solution robuste, évolutive et sécurisée pour répondre aux besoins de gestion de projet modernes. Ses principales forces sont :

- **Modularité** : Architecture en composants indépendants facilitant la maintenance et l'évolution
- **Scalabilité** : Capacité à s'adapter à des volumes croissants d'utilisateurs et de projets
- **Flexibilité** : Possibilité d'ajouter de nouvelles fonctionnalités sans impacter l'existant
- **Sécurité** : Contrôles d'accès à tous les niveaux et protection des données sensibles
- **Performance** : Optimisation des temps de réponse et de la consommation des ressources
- **Intégration** : Capacité à s'interfacer avec d'autres systèmes de l'écosystème informatique

Les perspectives d'évolution incluent :

- L'intégration de fonctionnalités d'intelligence artificielle pour l'aide à la décision
- Le développement d'applications mobiles natives pour améliorer l'expérience utilisateur
- L'extension des capacités d'analyse prédictive pour anticiper les risques et les tendances
- L'amélioration des fonctionnalités collaboratives avec des outils de communication intégrés

Cette architecture constitue une base solide pour un système de gestion de projet moderne, capable de s'adapter aux évolutions des méthodologies et des technologies dans le domaine de la gestion de projet.