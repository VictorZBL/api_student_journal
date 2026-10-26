import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi } from '../api/client'
import StudentsTable from '../components/StudentTable'

export default function StudentsListPage() {
    const [students, setStudents] = useState([])
    const [search, setSearch] = useState('')
    const [group, setGroup] = useState('')
    const [sortBy, setSortBy] = useState('id')
    const [order, setOrder] = useState('asc')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await studentsApi.list({
                search: search || undefined,
                group: group || undefined,
                sort_by: sortBy,
                order,
                limit: 100,
            })
            setStudents(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [search, group, sortBy, order])

    useEffect(() => {
        load().catch((err) => { //оно жалуется, что я вызываю setState внутри useEffect :((
            console.error("Ошибка при загрузке:", err)
        }) 
    }, [load])

    const handleDelete = async (student) => {
        if (!window.confirm(`Удалить студента "${student.full_name}"?`)) return
        try {
            await studentsApi.remove(student.id)
            load()
        } catch (e) {
            setError(e.message)
        }
    }
    return (
        <section>
            <div className='toolbar'>
                <h2>Студенты</h2>
                <Link to="/students/new" className='btn btn-primary'>+ Добавить студента</Link>
            </div>
            <div className='filters'>
                <input
                    placeholder="Поиск по ФИО"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}/>
                <input
                    placeholder='Фильтр по группе'
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}/>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="id">Сортировать по id</option>
                    <option value="full_name">По ФИО</option>
                    <option value='group'>По группе</option>
                </select>
                <select value={order} onChange={(e) => setOrder(e.target.value)}>
                    <option value='asc'>По возрастанию</option>
                    <option value='desc'>По убыванию</option>
                </select>
            </div>
            {error && <div className='error'>{error}</div>}
            {loading ? <p>Загрузка...</p> : (
                <StudentsTable students={students} onDelete={handleDelete} />
            )}
        </section>
    )
}