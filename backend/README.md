# Backend BibliO (Python / FastAPI)

## Installation

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Base de données (phpMyAdmin)

- Importer le fichier `../database/biblio.sql` dans phpMyAdmin.
- Adapter ensuite les variables `DB_*` dans `backend/.env`.

## Lancer l’API

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Comptes de démonstration

- Adhérent: `adherent@demo.com` / mot de passe: `demo123`
- Bibliothécaire: `biblio@demo.com` / mot de passe: `demo123`

