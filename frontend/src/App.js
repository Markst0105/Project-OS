// The Correct App.js

import React from 'react';
// CORRECT IMPORTS FOR ROUTER
import { Routes, Route, Link } from 'react-router-dom';

// MAKE SURE THESE IMPORTS ARE CORRECT (no '*' or '{ }')
import Home from './pages/Home';
import SystemCalls from './pages/SystemCalls';
import Processes from './pages/Processes';
import ProducerConsumer from './pages/ProducerConsumer';
import MemoryManagement from './pages/MemoryManagement';
import './App.css';

function App() {
    return (
        <div>
            <nav className="navbar">
                <Link to="/" className="nav-brand">Sistemas Operacionais Interativos</Link>
                <ul className="nav-links">
                    <li><Link to="/system-calls">Chamadas de Sistema</Link></li>
                    <li><Link to="/processes">Processos</Link></li>
                    <li><Link to="/producer-consumer">Produtor/Consumidor</Link></li>
                    <li><Link to="/memory-management">Gerência de Memória</Link></li>
                </ul>
            </nav>

            <main className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/system-calls" element={<SystemCalls />} />
                    <Route path="/processes" element={<Processes />} />
                    <Route path="/producer-consumer" element={<ProducerConsumer />} />
                    <Route path="/memory-management" element={<MemoryManagement />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;