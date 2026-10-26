import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { studentsApi } from '../api/client'

const emptyForm = { full_name: '', group: '' }

export default function StudentFormPage() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const navigate = useNavigate()
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if(!isEdit) return
        let cancelled = false
        ;(async () => {
            try {
                const student = await studentsApi.get(id)
                if (!cancelled) setForm({ full_name: student.full_name, group: student.group })
            } catch (e) {
                if (!cancelled) setError(e.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => { cancelled = true }
    }, [id, isEdit])
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        if (!form.full_name.trim() || !form.group.trim()) {
            setError('Заполните ФИО и группу')
            return
        }
        setSaving(true)
        try {
            if (isEdit) {
                await studentsApi.update(id, form)
                navigate(`/students/${id}`)
            } else {
                const created = await studentsApi.create(form)
                navigate(`/students/${created.id}`)
            }
        } catch (e) {
            setError(e.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p>Загрузка...</p>

    return (
        <section>
            <h2>{isEdit ? 'Редактирование студента' : 'Новый студент'}</h2>
            <form className="form" onSubmit={handleSubmit}>
                <label>
                    ФИО
                    <input name='full_name' value={form.full_name} onChange={handleChange} maxLength={255} />
                </label>
                <label>
                    Группа
                    <input name='group' value={form.group} onChange={handleChange} maxLength={50} />
                </label>
                {error && <div className='error'>{error}</div>}
                <div className='form-actions'>
                    <button type='submit' className='btn btn-primary' disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button type='button' className='btn' onClick={() => navigate(-1)}>Отменить</button>
                </div>
            </form>
        </section>
    )
}