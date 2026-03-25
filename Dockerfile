# Frontend Dockerfile pour Next.js (Production)
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Installer les dépendances
# On utilise npm install pour plus de simplicité ici
RUN npm install

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Exposer le port par défaut de Render
EXPOSE 10000

# Variables d'environnement pour la production
ENV NODE_ENV production
ENV PORT 10000

# Lancement en mode production sur 0.0.0.0
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "10000"]
