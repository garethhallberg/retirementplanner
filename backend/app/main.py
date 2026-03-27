from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, checklist, countdown, financial, goals, users

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(financial.router)
app.include_router(checklist.router)
app.include_router(countdown.router)
app.include_router(goals.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
