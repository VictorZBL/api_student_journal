import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
    return(
        <div className="app">
            <header className="header">
                <h1>Student Jornal</h1>
                <nav className="nav">
                    <NavLink to="/students" 
                        className={({ isActive }) => (isActive ? 'active' : '')}>
                        Студенты
                    </NavLink>
                    <NavLink to="/grades" 
                        className={({ isActive }) => (isActive ? 'active' : '')}>
                        Оценки
                    </NavLink>
                </nav>
            </header>
            <main className="content">{children}</main>
        </div>
    )
}