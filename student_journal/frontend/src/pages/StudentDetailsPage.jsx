import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { studentsApi, gradesApi } from '../api/client.js'

export default function StudentDetailsPage() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [average, setAverage] = useState(null)
  const [grades, setGrades] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, a, g] = await Promise.all([
          studentsApi.get(id),
          studentsApi.average(id),
          gradesApi.list({ student_id: Number(id), limit: 100 }),
        ])
        if (cancelled) return
        setStudent(s)
        setAverage(a)
        setGrades(g)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  const handleDeleteGrade = async (grade) => {
    if (!window.confirm('Удалить оценку?')) return
    try {
      await gradesApi.remove(grade.id)
      setGrades((prev) => prev.filter((x) => x.id !== grade.id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <div className="error">{error}</div>
  if (!student) return <p>Загрузка…</p>

  return (
    <section>
      <div className="toolbar">
        <h2>{student.full_name}</h2>
        <Link to={`/students/${student.id}/edit`} className="btn">Редактировать</Link>
      </div>
      <p><strong>Группа:</strong> {student.group}</p>
      {average && (
        <p>
          <strong>Средний балл:</strong> {average.average_mark} ({average.grades_count} оценок)
        </p>
      )}

      <div className="toolbar">
        <h3>Оценки</h3>
        <Link to={`/grades/new?student_id=${student.id}`} className="btn btn-primary">
          + Добавить оценку
        </Link>
      </div>

      {grades.length === 0 ? (
        <p className="empty">Оценок пока нет</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Предмет</th><th>Оценка</th><th>Семестр</th><th>Дата</th><th></th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id}>
                <td>{g.subject}</td>
                <td>{g.mark}</td>
                <td>{g.semester}</td>
                <td>{g.grade_date}</td>
                <td className="actions">
                  <Link to={`/grades/${g.id}/edit`} className="btn btn-sm">Изменить</Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGrade(g)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}