from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import dispose_db, init_db
from routes import behavioral, billing, health, jobs, project_helper, saved_jobs


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await dispose_db()


app = FastAPI(lifespan=lifespan)
app.include_router(health.router)
app.include_router(project_helper.router)
app.include_router(jobs.router)
app.include_router(behavioral.router)
app.include_router(saved_jobs.router)
app.include_router(billing.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

