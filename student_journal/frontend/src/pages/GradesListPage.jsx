import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { gradesApi } from '../api/client.js'

export default function GradesListPage() {
  const [grades, setGrades] = useState([])
  const [filters, setFilters] = useState({ subject: '', semester: '', min_mark: '', max_mark: '' })
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const params = {
        subject: filters.subject || undefined,
        semester: filters.semester ? Number(filters.semester) : undefined,
        min_mark: filters.min_mark ? Number(filters.min_mark) : undefined,
        max_mark: filters.max_mark ? Number(filters.max_mark) : undefined,
        limit: 100,
      }
      setGrades(await gradesApi.list(params))
    } catch (e) {
      setError(e.message)
    }
  }, [filters])

  useEffect(() => { load() }, [load]) // и опять нельзя пызывать setState в use Effect :<

  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleDelete = async (grade) => {
    if (!window.confirm('Удалить оценку?')) return
    try {
      await gradesApi.remove(grade.id)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <div className="toolbar">
        <h2>Оценки</h2>
        <Link to="/grades/new" className="btn btn-primary">+ Добавить оценку</Link>
      </div>

      <div className="filters">
        <input name="subject" placeholder="Предмет" value={filters.subject} onChange={handleChange} />
        <input name="semester" type="number" min="1" max="12" placeholder="Семестр"
               value={filters.semester} onChange={handleChange} />
        <input name="min_mark" type="number" min="1" max="5" placeholder="Мин. оценка"
               value={filters.min_mark} onChange={handleChange} />
        <input name="max_mark" type="number" min="1" max="5" placeholder="Макс. оценка"
               value={filters.max_mark} onChange={handleChange} />
      </div>

      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Студент</th><th>Предмет</th><th>Оценка</th>
            <th>Семестр</th><th>Дата</th><th></th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td><Link to={`/students/${g.student_id}`}>#{g.student_id}</Link></td>
              <td>{g.subject}</td>
              <td>{g.mark}</td>
              <td>{g.semester}</td>
              <td>{g.grade_date}</td>
              <td className="actions">
                <Link to={`/grades/${g.id}/edit`} className="btn btn-sm">Изменить</Link>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}