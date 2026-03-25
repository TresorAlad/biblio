# Guide de déploiement avec Docker

## Prérequis
- Docker Desktop installé
- Docker Compose installé (inclus dans Docker Desktop)

## Lancer l'application

### 1. Première exécution
```bash
# Construire les images
docker-compose build

# Lancer tous les services
docker-compose up -d
```

### 2. Accès aux services
- **Frontend (Next.js)**: http://localhost:3000
- **Backend (FastAPI)**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs
- **MySQL**: localhost:3306

### 3. Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Arrêter l'application
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v

# Redémarrer les services
docker-compose restart

# Exécuter une commande dans un conteneur
docker-compose exec backend bash
docker-compose exec frontend bash
docker-compose exec mysql mysql -u root -p
```

## Configuration

### Variables d'environnement
Les variables d'environnement sont configurées dans `docker-compose.yml`. Pour les modifier:

1. **Backend**: Modifier les variables `environment` du service `backend` dans `docker-compose.yml`
2. **Frontend**: Modifier les variables du service `frontend`

### Base de données
- La base de données MySQL est initialisée avec le fichier `database/biblio.sql`
- Les données sont persistantes dans le volume `mysql_data`

### Dépendances
- Le backend attend que MySQL soit accessible avant de démarrer (healthcheck)
- Le frontend dépend du backend

## Développement

Pour développer avec hot-reload:
- Les fichiers du frontend sont montés en volume (`volumes` du service frontend)
- Les fichiers du backend sont montés en volume (`volumes` du service backend)
- Changez votre code, les services redémarreront automatiquement

## Dépannage

### Erreur de connexion à MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Assurez-vous que MySQL est démarré: `docker-compose logs mysql`
- Attendez quelques secondes que le healthcheck passe

### Port déjà en utilisation
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```
Changez les ports dans `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Utiliser 3001 au lieu de 3000
```

### Importer des données supplémentaires avec MySQL
```bash
docker-compose exec -T mysql mysql -u root -prootpass biblio < dump.sql
```

## Secrets en production
⚠️ **IMPORTANT**: Pour la production:
1. Changez `APP_SECRET_KEY` dans `docker-compose.yml`
2. Changez `MYSQL_ROOT_PASSWORD`
3. Utilisez un fichier `.env` au lieu de variables en clair
