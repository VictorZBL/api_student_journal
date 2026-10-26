import { Link } from 'react-router-dom'

export default function StudentsTable({ students, onDelete }) {
    if (!students.length) return <p className="empty">Студентов нет</p>
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>id</th>
                    <th>ФИО</th>
                    <th>Группа</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {students.map((s) => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>
                            <Link to={`/students/${s.id}`}>{s.full_name}</Link>
                        </td>
                        <td>{s.group}</td>
                        <td className='actions'>
                            <Link to={`/students/${s.id}/edit`} className='btn btn-sm'>Изменить</Link>
                            <button className='btn btn-sm btn-danger' onClick={() => onDelete(s)}>
                                Удалить
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}