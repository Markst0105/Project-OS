import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import all your pages and components
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import SystemCalls from './pages/SystemCalls';
import Processes from './pages/Processes';
import ProducerConsumer from './pages/ProducerConsumer';
import MemoryManagement from './pages/MemoryManagement';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="app-content">
                {/* ================================================= */}
                {/* THIS IS THE TOP NAVIGATION BAR                    */}
                {/* ================================================= */}
                <nav className="navbar">
                    <Link to="/" className="nav-brand">Sistemas Operacionais Interativos</Link>
                    <ul className="nav-links">
                        <li><Link to="/system-calls">Chamadas de Sistema</Link></li>
                        <li><Link to="/processes">Processos</Link></li>
                        <li><Link to="/producer-consumer">Produtor/Consumidor</Link></li>
                        <li><Link to="/memory-management">Gerência de Memória</Link></li>

                        {/* This is the conditional logic for Login/Logout */}
                        {isAuthenticated ? (
                            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                        ) : (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </nav>

                <main className="container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/system-calls" element={<SystemCalls />} />
                        <Route path="/processes" element={<Processes />} />
                        <Route path="/producer-consumer" element={<ProducerConsumer />} />
                        <Route path="/memory-management" element={<MemoryManagement />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </main>
            </div>

            {/* The global footer will be at the bottom of all pages */}
            <Footer />
        </>
    );
}

export default App;