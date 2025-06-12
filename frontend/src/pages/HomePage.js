// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We'll create this CSS file

const modules = [
    {
        name: 'Module 1: System Calls',
        description: 'Compile and run C code examples directly in your browser to understand how programs interact with the kernel.',
        link: '/system-calls',
        icon: 'fas fa-terminal' // Using Font Awesome class names as an example
    },
    {
        name: 'Module 2: Process Behavior',
        description: 'Analyze the performance of CPU-bound vs. I/O-bound processes and see how they utilize system resources differently.',
        link: '/processes',
        icon: 'fas fa-microchip'
    },
    {
        name: 'Module 3: Producer-Consumer',
        description: 'An interactive simulator for the classic concurrency problem. Configure producers, consumers, and buffer size in real-time.',
        link: '/producer-consumer',
        icon: 'fas fa-sync-alt'
    },
    {
        name: 'Module 4: Memory Management',
        description: 'Visualize how virtual memory and page replacement algorithms like FIFO and LRU work with a step-by-step simulator.',
        link: '/memory-management',
        icon: 'fas fa-memory'
    }
];

function HomePage() {
    return (
        <div className="home-page">
            <header className="hero-section">
                <h1>Operating Systems: The Interactive Experience</h1>
                <p className="subtitle">
                    Bringing fundamental OS concepts to life through practical examples and live simulators.
                </p>
                <Link to="/system-calls" className="cta-button">Get Started</Link>
            </header>

            <section className="modules-section">
                <h2>Explore the Modules</h2>
                <div className="modules-grid">
                    {modules.map(module => (
                        <div key={module.name} className="module-card">
                            <i className={module.icon}></i>
                            <h3>{module.name}</h3>
                            <p>{module.description}</p>
                            <Link to={module.link} className="module-button">Explore Module</Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default HomePage;