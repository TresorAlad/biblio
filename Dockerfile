# Frontend Dockerfile pour Next.js
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Installer les dépendances
RUN npm install -g pnpm && pnpm install && npm install

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
