// frontend/src/components/Footer.js
import React from 'react';
import './Footer.css'; // We'll create this CSS file

function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>About This Project</h4>
                    <p>
                        An interactive web application for exploring fundamental Operating Systems concepts,
                        developed as a project for the Operating Systems course at ICMC, USP.
                    </p>
                </div>
                <div className="footer-section">
                    <h4>Reference Links</h4>
                    <ul className="footer-links">
                        {/* Add your reference links here */}
                        <li><a href="https://www.os-book.com/" target="_blank" rel="noopener noreferrer">Operating System Concepts (The Dinosaur Book)</a></li>
                        <li><a href="https://www.kernel.org/" target="_blank" rel="noopener noreferrer">The Linux Kernel Archives</a></li>
                        <li><a href="https://spring.io/" target="_blank" rel="noopener noreferrer">Spring Framework</a></li>
                        <li><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a></li>
                        <li><a href="https://github.com/Markst0105/Project-OS" target="_blank" rel="noopener noreferrer">Full open source code (GitHub)</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 - University of São Paulo (USP)</p>
            </div>
        </footer>
    );
}

export default Footer;