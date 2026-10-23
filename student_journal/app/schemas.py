from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

class StudentBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    group: str = Field(..., min_length=1, max_length=50)

class StudenCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    group: Optional[str] = Field(None, min_length=1, max_length=50)

class StudentRead(StudentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class GradeBase(BaseModel):
    student_id: int
    subject: str = Field(..., min_length=1, max_length=255)
    mark: int = Field(..., ge=1, le=5)
    semester: int = Field(..., ge=1, le=12)
    grade_date: Optional[date] = None

    @field_validator("subject")
    @classmethod
    def subject_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("укажите предмет оценки")
        return v.strip()

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    mark: Optional[int] = Field(None, gr=1, le=5)
    semester: Optional[int] = Field(None, ge=1, le=12)
    grade_date: Optional[date] = None

class GradeRead(GradeBase):
    id: int
    grade_date: date
    model_config = ConfigDict(from_attributes=True)

class StudentAverage(BaseModel):
    student_id: int
    full_name: str
    average_mark: float
    grades_count: int

class GroupAverage(BaseModel):
    group: str
    average_mark: float
    student_count: int