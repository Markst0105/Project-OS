// frontend/src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
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
        <div>
            <nav className="navbar">
                <Link to="/" className="nav-brand">Sistemas Operacionais Interativos</Link>
                <ul className="nav-links">
                    {/* Common Links */}
                    <li><Link to="/system-calls">Chamadas de Sistema</Link></li>
                    <li><Link to="/processes">Processos</Link></li>
                    <li><Link to="/producer-consumer">Produtor/Consumidor</Link></li>
                    <li><Link to="/memory-management">Gerência de Memória</Link></li>

                    {/* Conditional Auth Links */}
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
                    <Route path="/" element={<Home />} />
                    <Route path="/system-calls" element={<SystemCalls />} />
                    <Route path="/processes" element={<Processes />} />
                    <Route path="/producer-consumer" element={<ProducerConsumer />} />
                    <Route path="/memory-management" element={<MemoryManagement />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;