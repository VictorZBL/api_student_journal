from typing import Optional, Sequence
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas

async def create_student(db: AsyncSession, data: schemas.StudenCreate) -> models.Student:
    student = models.Student(**data.model_dump())
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student

async def get_student(db: AsyncSession, student_id: int) -> Optional[models.Student]:
    return await db.get(models.Student, student_id)

async def list_student(
    db: AsyncSession,
    group: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "id",
    order: str = "asc",
    limit: int = 20,
    offset: int = 0,
) -> Sequence[models.Student]: 
    stmt = select(models.Student)
    if group:
        stmt = stmt.where(models.Student.group == group)
    if search:
        stmt = stmt.where(models.Student.full_name.ilike(f"%{search}%"))
    sort_column = getattr(models.Student, sort_by, models.Student.id)
    stmt = stmt.order_by(sort_column.desc() if order == "desc" else sort_column.asc())
    stmt = stmt.limit(limit).offset(offset)

    result = await db.execute(stmt)
    return result.scalars().all()

async def update_student(
    db: AsyncSession, student: models.Student, data: schemas.StudentUpdate
) -> models.Student:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    await db.commit()
    await db.refresh(student)
    return student

async def delete_student(db: AsyncSession, student: models.Student) -> None:
    await db.delete(student)
    await db.commit()


async def create_grade(db: AsyncSession, data: schemas.GradeCreate) -> models.Grade:
    payload = data.model_dump(exclude_none=True)
    grade = models.Grade(**payload)
    db.add(grade)
    await db.commit()
    await db.refresh(grade)
    return grade

async def get_grade(db: AsyncSession, grade_id: int) -> Optional[models.Grade]:
    return await db.get(models.Grade, grade_id)

async def list_grades(
    db: AsyncSession,
    student_id: Optional[int] = None,
    subject: Optional[str] = None,
    semester: Optional[int] = None,
    min_mark: Optional[int] = None,
    max_mark: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
) -> Sequence[models.Grade]:
    stmt = select(models.Grade)
    if student_id is not None:
        stmt = stmt.where(models.Grade.student_id == student_id)
    if subject:
        stmt = stmt.where(models.Grade.subject.ilike(f"%{subject}%"))
    if semester is not None:
        stmt = stmt.where(models.Grade.semester == semester)
    if min_mark is not None:
        stmt = stmt.where(models.Grade.mark >= min_mark)    
    if max_mark is not None:
        stmt = stmt.where(models.Grade.mark <= max_mark)
    stmt = stmt.order_by(models.Grade.grade_date.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_grade(
    db: AsyncSession, grade: models.Grade, data: schemas.GradeCreate
) -> models.Grade:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(grade, field, value)
    await db.commit()
    await db.refresh(grade)
    return grade

async def delete_grade(db: AsyncSession, grade: models.Grade) -> None:
    await db.delete(grade)
    await db.commit()


async def student_average(db: AsyncSession, student_id: int) -> Optional[schemas.StudentAverage]:
    stmt = (
        select(
            models.Student.id,
            models.Student.full_name,
            func.avg(models.Grade.mark).label("avg_mark"),
            func.count(models.Grade.id).label("cnt"),
        )
        .join(models.Grade, models.Grade.student_id == models.Student.id, isouter=True)
        .where(models.Student.id == student_id)
        .group_by(models.Student.id, models.Student.full_name)
    )
    row = (await db.execute(stmt)).first()
    if not row:
        return None
    return schemas.StudentAverage(
        student_id=row.id,
        full_name=row.full_name,
        average_mark=round(float(row.avg_mark or 0), 2),
        grades_count=row.cnt,
    )

async def all_students_average(
    db: AsyncSession, min_average: Optional[float] = None
) -> list[schemas.StudentAverage]:
    stmt = (
        select(
            models.Student.id,
            models.Student.full_name,
            func.avg(models.Grade.mark).label("avg_mark"),
            func.count(models.Grade.id).label("cnt"),
        )
        .join(models.Grade, models.Grade.student_id == models.Student.id, isouter=True)
        .group_by(models.Student.id, models.Student.full_name)
        .order_by(func.avg(models.Grade.mark).desc().nullslast())
    )
    rows = (await db.execute(stmt)).all()
    result = [
        schemas.StudentAverage(
            student_id=r.id,
            full_name=r.full_name,
            average_mark=round(float(r.avg_mark or 0), 2),
            grades_count=r.cnt,
        )
        for r in rows 
    ]
    if min_average is not None:
        result = [r for r in result if r.average_mark >= min_average]
    return result

async def group_average(db: AsyncSession) -> list[schemas.GroupAverage]:
    stmt = (
        select(
            models.Student.group,
            func.avg(models.Grade.mark).labels("avg_mark"),
            func.count(func.distinct(models.Student.id)).label("students_cnt"),
        )
        .join(models.Grade, models.Grade.student_id == models.Student.id, isouter=True)
        .group_by(models.Student.group)
        .order_by(models.Student.group)
    )
    rows = (await db.execute(stmt)).all()
    return [
        schemas.GroupAverage(
            group=r.group,
            average_mark=round(float(r.avg_mark or 0), 2),
            students_count=r.students_cnt,
        )
        for r in rows
    ]

