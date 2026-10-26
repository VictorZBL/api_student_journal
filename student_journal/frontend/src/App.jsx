import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import StudentsListPage from './pages/StudentsListPage.jsx'
import StudentFormPage from './pages/StudentFormPage.jsx'
import StudentDetailsPage from './pages/StudentDetailsPage.jsx'
import GradesListPage from './pages/GradesListPage.jsx'
import GradeFormPage from './pages/GradeFormPage.jsx'


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="/students/new" element={<StudentFormPage />} />
        <Route path="/students/:id" element={<StudentDetailsPage />} />
        <Route path="/students/:id/edit" element={<StudentFormPage />} />
        <Route path="/grades" element={<GradesListPage />} />
        <Route path="/grades/new" element={<GradeFormPage />} />
        <Route path="/grades/:id/edit" element={<GradeFormPage />} />
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </Layout>   
  )
}

export default App
