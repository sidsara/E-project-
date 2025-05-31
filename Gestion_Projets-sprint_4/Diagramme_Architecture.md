# Diagrammes d'Architecture - Système de Gestion de Projets Académiques

## 1. Architecture Globale

```
+-------------------+         +-------------------+
|                   |         |                   |
|     FRONTEND      |<------->|      BACKEND      |
|     (React)       |   API   |    (Express.js)   |
|                   |  REST   |                   |
+-------------------+         +---------+---------+
                                        |
                                        | Prisma ORM
                                        |
                              +---------v---------+
                              |                   |
                              |    PostgreSQL     |
                              |   Base de données |
                              |                   |
                              +-------------------+
```

## 2. Architecture MVC

```
+-------------------+         +-------------------+         +-------------------+
|                   |         |                   |         |                   |
|       MODÈLE      |<------->|    CONTRÔLEUR     |<------->|        VUE        |
|  (Prisma Schema)  |         | (Express Routes)  |         |  (React Components)|
|                   |         |                   |         |                   |
+-------------------+         +-------------------+         +-------------------+
```

## 3. Flux d'Authentification

```
+-------------+    1. Login     +-------------+
|             |--------------->|             |
|   Client    |                |   Serveur   |
|  (Browser)  |<---------------|  (Express)  |
|             |  2. JWT Token  |             |
+------+------+                +------+------+
       |                              |
       | 3. Requêtes avec             | 4. Vérification
       |    Token JWT                 |    du Token
       v                              v
+------+------+                +------+------+
|             |    5. Accès   |             |
| Ressources  |<-------------+| Middleware  |
|  Protégées  |   Autorisé   |  d'Auth JWT  |
|             |              |             |
+-------------+              +-------------+
```

## 4. Modèle de Données Simplifié

```
+-------------+     +-------------+     +-------------+
|             |     |             |     |             |
|   Etudiant  +---->+    Equipe   +---->+    Projet   |
|             |     |             |     |             |
+-------------+     +------+------+     +------+------+
                           |                  |
                           |                  |
                    +------v------+    +------v------+
                    |             |    |             |
                    |    Sujet    |    |  Soutenance |
                    |             |    |             |
                    +------+------+    +------+------+
                           |                  |
                           |                  |
                    +------v------+    +------v------+
                    |             |    |             |
                    | Enseignant  |    |  Livrable   |
                    |             |    |             |
                    +-------------+    +-------------+
```

## 5. Architecture des Routes API

```
+-------------------+
|                   |
|    API Gateway    |
|    (Express.js)   |
|                   |
+---------+---------+
          |
          |
+---------v---------+     +---------+---------+     +---------+---------+
|                   |     |                   |     |                   |
|  Routes Utilisateurs |  Routes Projets    |  Routes Soutenances |
|   (authRoute.js)   |     | (projectRoute.js) |     | (soutenanceRoute.js)|
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+

+---------+---------+     +---------+---------+     +---------+---------+
|                   |     |                   |     |                   |
|   Routes Équipes  |     |   Routes Sujets   |     | Routes Invitations |
|  (equipeRoute.js) |     |  (sujetRoutes.js) |     |(invitationRoutes.js)|
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```

## 6. Flux de Travail Principal

```
+-------------+     +-------------+     +-------------+
|             |     |             |     |             |
| Création    +---->+ Affectation +---->+ Suivi du    |
| d'Équipe    |     | de Sujet    |     | Projet      |
|             |     |             |     |             |
+-------------+     +-------------+     +------+------+
                                               |
                                               |
+-------------+     +-------------+     +------v------+
|             |     |             |     |             |
| Évaluation  |<----+ Soutenance  |<----+ Soumission  |
| et PV       |     |             |     | Livrables   |
|             |     |             |     |             |
+-------------+     +-------------+     +-------------+
```