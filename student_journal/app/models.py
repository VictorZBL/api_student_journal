from datetime import date
from sqlalchemy import ForeignKey, Index, String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Student(Base):
    __tablename__ = "students"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    group: Mapped[str] = mapped_column("group", String(50), nullable=False)
    grades: Mapped[list["Grade"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )
    
class Grade(Base):
    __tablename__ = "grades"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    mark: Mapped[int] = mapped_column(Integer, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    grade_date: Mapped[date] = mapped_column(Date, server_default="CURRENT_DATE")
    student: Mapped["Student"] = relationship(back_populates="grades")