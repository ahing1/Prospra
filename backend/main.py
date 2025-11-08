from fastapi import FastAPI
from routes import generate
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(generate.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

