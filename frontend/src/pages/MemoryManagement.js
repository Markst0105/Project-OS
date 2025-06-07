// src/pages/MemoryManagement.js
import React, { useState } from 'react';
import './MemoryManagement.css'; // CSS específico

function MemoryManagement() {
    const [algorithm, setAlgorithm] = useState('LRU');
    const [numFrames, setNumFrames] = useState(4);
    const [refString, setRefString] = useState('1,2,3,4,1,2,5,1,2,3,4,5');
    const [simulationResult, setSimulationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulate = async () => {
        setIsLoading(true);
        setSimulationResult(null);
        try {
            const response = await fetch('http://localhost:8080/api/memory/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm, numFrames, referenceString: refString }),
            });
            const data = await response.json();
            setSimulationResult(data);
        } catch (error) {
            setSimulationResult({ error: `Erro de conexão: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Módulo 4: Gerenciamento de Memória Virtual</h1>
            <div className="control-panel">
                <label>Algoritmo:
                    <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                        <option value="FIFO">FIFO</option>
                        <option value="LRU">LRU</option>
                    </select>
                </label>
                <label>Nº de Frames: <input type="number" value={numFrames} onChange={e => setNumFrames(Number(e.target.value))} min="1" /></label>
                <label>Sequência de Referências: <input type="text" value={refString} onChange={e => setRefString(e.target.value)} style={{width: '300px'}}/></label>
                <button onClick={handleSimulate} disabled={isLoading}>Simular</button>
            </div>

            {isLoading && <p>Simulando...</p>}

            {simulationResult && (
                <div className="memory-results">
                    <h3>Resultados da Simulação</h3>
                    <h4>Total de Page Faults: {simulationResult.pageFaults}</h4>
                    {simulationResult.steps.map((step, index) => (
                        <div key={index} className="memory-step">
                            <p><strong>Passo {index + 1}:</strong> Referência à página <strong>{step.pageReferenced}</strong> - <span className={step.isPageFault ? 'fault' : 'hit'}>{step.isPageFault ? 'Page Fault' : 'Hit'}</span></p>
                            <div className="frames-container">
                                {step.frames.map((frame, fIndex) => (
                                    <div key={fIndex} className={`frame ${frame.pageNumber === step.pageReferenced ? 'highlight' : ''}`}>
                                        <strong>Frame {fIndex}</strong>
                                        <span>{frame.pageNumber !== null ? `Página ${frame.pageNumber}` : 'Vazio'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MemoryManagement;