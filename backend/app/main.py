from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import adherents, auth, categories, emprunts, livres, penalites, reservations


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": settings.app_name, "env": settings.app_env}


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(livres.router)
app.include_router(emprunts.router)
app.include_router(reservations.router)
app.include_router(penalites.router)
app.include_router(adherents.router)

