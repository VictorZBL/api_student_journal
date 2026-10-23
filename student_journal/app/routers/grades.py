from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/grades", tags=["grades"])

@router.post("", response_model=schemas.GradeRead, status_code=status.HTTP_201_CREATED)
async def create_grade(data: schemas.GradeCreate, db: AsyncSession = Depends(get_db)):
    student = await crud.get_student(db, data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    return await crud.create_grade(db, data)

@router.get("", response_model=list[schemas.GradeRead])
async def list_grades(
    student_id: Optional[int] = Query(None),
    subject: Optional[int] = Query(None),
    semester: Optional[int] = Query(None, ge=1, le=12),
    min_mark: Optional[int] = Query(None, ge=1, le=5),
    max_mark: Optional[int] = Query(None, ge=1, le=5),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await crud.list_grades(
        db, student_id=student_id, subject=subject, semester=semester,
        min_mark=min_mark, max_mark=max_mark, limit=limit, offset=offset,
    )

@router.get("/{grade_id}", response_model=schemas.GradeRead)
async def get_grade(grade_id: int, db: AsyncSession = Depends(get_db)):
    grade = await crud.get_grade(db, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    return grade

@router.patch("/{grade_id}", response_model=schemas.GradeRead)
async def update_grade(
    grade_id: int,
    data: schemas.GradeUpdate,
    db: AsyncSession = Depends(get_db),
):
    grade = await crud.get_grade(db, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    return await crud.update_grade(db, grade, data)

@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_grade(grade_id: int, db: AsyncSession = Depends(get_db)):
    grade = await crud.get_grade(db, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    await crud.delete_grade(db, grade)