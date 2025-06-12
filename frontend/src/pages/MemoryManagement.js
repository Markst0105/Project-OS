// frontend/src/pages/MemoryManagement.js
import React, { useState } from 'react';
import './MemoryManagement.css';
import FeedbackSection from "../components/FeedbackSection";

function MemoryManagement() {
    // Form inputs
    const [algorithm, setAlgorithm] = useState('FIFO');
    const [numFrames, setNumFrames] = useState(4);
    const [refString, setRefString] = useState('1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5');

    // Simulation state
    const [simulationResult, setSimulationResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSimulate = async () => {
        setIsLoading(true);
        setError('');
        setSimulationResult(null);
        try {
            const response = await fetch('http://localhost:8080/api/memory/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm, numFrames, referenceString: refString }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred during simulation.');
            }
            setSimulationResult(data);
            setCurrentStep(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const step = simulationResult?.steps[currentStep];
    const totalSteps = simulationResult?.steps.length || 0;

    return (
        <div>
            <h1>Módulo 4: Gerenciamento de Memória Virtual</h1>
            <div className="sim-controls">
                <div className="input-group">
                    <label>Algorithm:</label>
                    <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                        <option value="FIFO">FIFO</option>
                        <option value="LRU">LRU</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Number of Frames:</label>
                    <input type="number" value={numFrames} min="1" onChange={e => setNumFrames(Number(e.target.value))} />
                </div>
                <div className="input-group full-width">
                    <label>Reference String (comma or space separated):</label>
                    <input type="text" value={refString} onChange={e => setRefString(e.target.value)} />
                </div>
                <button onClick={handleSimulate} disabled={isLoading}>
                    {isLoading ? 'Simulating...' : 'Run Simulation'}
                </button>
            </div>

            {error && <pre className="output-area error">{error}</pre>}

            {simulationResult && (
                <div className="results-area">
                    <h2>Simulation Results</h2>
                    <div className="summary">
                        <p><strong>Total Page Faults:</strong> {simulationResult.totalPageFaults}</p>
                        <p><strong>Total Hits:</strong> {simulationResult.totalHits}</p>
                        <p><strong>Hit Ratio:</strong> {((simulationResult.totalHits / totalSteps) * 100).toFixed(2)}%</p>
                    </div>

                    <div className="step-controls">
                        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>Previous</button>
                        <span>Step: {currentStep + 1} / {totalSteps}</span>
                        <button onClick={() => setCurrentStep(s => Math.min(totalSteps - 1, s + 1))} disabled={currentStep >= totalSteps - 1}>Next</button>
                    </div>

                    <div className="step-info">
                        <p>Referencing Page: <strong>{step.pageReferenced}</strong></p>
                        <p>Status: <span className={step.isPageFault ? 'fault' : 'hit'}>{step.isPageFault ? 'Page Fault' : 'Hit'}</span></p>
                        {step.isPageFault && step.pageToReplace != null && (
                            <p>Action: Page <strong>{step.pageToReplace}</strong> was replaced by Page <strong>{step.pageReferenced}</strong>.</p>
                        )}
                        {step.isPageFault && step.pageToReplace == null && (
                            <p>Action: Page <strong>{step.pageReferenced}</strong> was placed in an empty frame.</p>
                        )}
                    </div>

                    <h3>Memory State</h3>
                    <div className="memory-frames">
                        {Array.from({ length: numFrames }).map((_, index) => {
                            const pageInMemory = step.memoryFrames[index];
                            const isJustLoaded = pageInMemory === step.pageReferenced && step.isPageFault;
                            return (
                                <div key={index} className={`frame ${isJustLoaded ? 'highlight' : ''}`}>
                                    <div className="frame-index">Frame {index}</div>
                                    <div className="frame-content">{pageInMemory !== undefined ? pageInMemory : 'Empty'}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <FeedbackSection moduleName="memory-management"/>
        </div>
    );
}

export default MemoryManagement;