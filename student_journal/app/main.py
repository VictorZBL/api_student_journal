from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .routers import students, grades

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(
    title="Student Jornal API",
    description="Лабораторная работа 1: API студенческого журнала. Вариант 2",
    version="1.3.3.7",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(grades.router)

@app.get("/", tags=["root"])
async def root():
    return {"message": "Student Journal API", "docs": "/docs", "redoc": "/redoc"}