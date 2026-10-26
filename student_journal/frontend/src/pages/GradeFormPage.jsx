import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { gradesApi, studentsApi } from '../api/client.js'

const emptyForm = {
  student_id: '',
  subject: '',
  mark: '5',
  semester: '1',
  grade_date: '',
}

export default function GradeFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    student_id: searchParams.get('student_id') || '',
  }))
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    studentsApi.list({ limit: 100 }).then(setStudents).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    gradesApi.get(id)
      .then((g) => {
        if (cancelled) return
        setForm({
          student_id: String(g.student_id),
          subject: g.subject,
          mark: String(g.mark),
          semester: String(g.semester),
          grade_date: g.grade_date || '',
        })
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => { cancelled = true }
  }, [id, isEdit])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const payload = {
      student_id: Number(form.student_id),
      subject: form.subject.trim(),
      mark: Number(form.mark),
      semester: Number(form.semester),
      grade_date: form.grade_date || null,
    }
    if (!payload.student_id || !payload.subject) {
      setError('Выберите студента и укажите предмет')
      return
    }
    setSaving(true)
    try {
      if (isEdit) await gradesApi.update(id, payload)
      else await gradesApi.create(payload)
      navigate(`/students/${payload.student_id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h2>{isEdit ? 'Редактирование оценки' : 'Новая оценка'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Студент
          <select name="student_id" value={form.student_id} onChange={handleChange}>
            <option value="">— выберите —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name} ({s.group})</option>
            ))}
          </select>
        </label>
        <label>
          Предмет
          <input name="subject" value={form.subject} onChange={handleChange} maxLength={255} />
        </label>
        <label>
          Оценка (1–5)
          <input name="mark" type="number" min="1" max="5"
                 value={form.mark} onChange={handleChange} />
        </label>
        <label>
          Семестр (1–12)
          <input name="semester" type="number" min="1" max="12"
                 value={form.semester} onChange={handleChange} />
        </label>
        <label>
          Дата
          <input name="grade_date" type="date" value={form.grade_date} onChange={handleChange} />
        </label>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>Отмена</button>
        </div>
      </form>
    </section>
  )
}