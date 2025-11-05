from fastapi import FastAPI
from routes import generate
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(generate.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
