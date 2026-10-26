from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=schemas.StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(
    data: schemas.StudenCreate,
    db: AsyncSession = Depends(get_db)
):
    return await crud.create_student(db, data)

@router.get("", response_model=list[schemas.StudentRead])
async def list_student(
    group: Optional[str] = Query(None, description="Фильтр по группе"),
    search: Optional[str] = Query(None, description="Поиск по ФИО"),
    sort_by: Literal["id", "full_name", "group"] = "id",
    order: Literal["asc", "desc"] = "asc",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await crud.list_student(
        db, group=group, search=search, sort_by=sort_by, order=order,
        limit=limit, offset=offset,
    )

@router.get("/averages", response_model=list[schemas.StudentAverage])
async def student_average(
    min_average: Optional[float] = Query(None, ge=0, le=5),
    db: AsyncSession = Depends(get_db),
):
    return await crud.all_students_average(db, min_average=min_average)

@router.get("/{student_id}", response_model=schemas.StudentRead)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    return student

@router.get("/{student_id}/average", response_model=schemas.StudentAverage)
async def student_average(student_id: int, db: AsyncSession = Depends(get_db)):
    avg = await crud.student_average(db, student_id)
    if not avg:
        raise HTTPException(status_code=404, detail="Студент не найден")
    return avg

@router.patch("/{student_id}", response_model=schemas.StudentRead)
async def update_student(
    student_id: int,
    data: schemas.StudentUpdate,
    db: AsyncSession = Depends(get_db),
):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    return await crud.update_student(db, student, data)

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    await crud.delete_student(db, student)