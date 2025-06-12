import React, { useState, useEffect, useRef } from 'react';
import './ProducerConsumer.css';

function ProducerConsumer() {
    // Config state
    const [numProducers, setNumProducers] = useState(2);
    const [numConsumers, setNumConsumers] = useState(2);
    const [bufferSize, setBufferSize] = useState(8);

    // Simulation state
    const [simulationState, setSimulationState] = useState({
        buffer: [],
        producers: [],
        consumers: [],
        isRunning: false
    });
    const [isConnected, setIsConnected] = useState(false);

    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080/ws/producer-consumer');
        ws.current.onopen = () => setIsConnected(true);
        ws.current.onclose = () => setIsConnected(false);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Update the entire simulation state at once
            setSimulationState({
                buffer: data.buffer || [],
                producers: data.producers || [],
                consumers: data.consumers || [],
                isRunning: data.isRunning || false
            });
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []); // This effect should only run once

    const handleStart = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            const message = {
                action: 'start',
                config: { numProducers, numConsumers, bufferSize }
            };
            ws.current.send(JSON.stringify(message));
        }
    };

    const handleStop = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'stop' }));
        }
    };

    // Create a visual buffer array based on the current state and config size
    const visualBuffer = Array(bufferSize).fill({ state: 'empty' });
    simulationState.buffer.forEach((item, index) => {
        visualBuffer[index] = { state: 'full', item: item };
    });

    return (
        <div>
            <h1>Módulo 3: Problema do Produtor-Consumidor</h1>
            <p>Status: <span style={{color: isConnected ? 'green' : 'red'}}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>

            <div className="control-panel">
                <label>Produtores: <input type="number" value={numProducers} onChange={e => setNumProducers(Number(e.target.value))} min="1" disabled={simulationState.isRunning} /></label>
                <label>Consumidores: <input type="number" value={numConsumers} onChange={e => setNumConsumers(Number(e.target.value))} min="1" disabled={simulationState.isRunning} /></label>
                <label>Tamanho do Buffer: <input type="number" value={bufferSize} onChange={e => setBufferSize(Number(e.target.value))} min="1" disabled={simulationState.isRunning} /></label>
                <button onClick={handleStart} disabled={simulationState.isRunning || !isConnected}>Iniciar</button>
                <button onClick={handleStop} disabled={!simulationState.isRunning}>Parar</button>
            </div>

            <h3>Buffer (Size: {bufferSize})</h3>
            <div className="buffer-container">
                {visualBuffer.map((slot, index) => (
                    <div key={index} className={`buffer-slot ${slot.state}`}>
                        {slot.state === 'full' ? slot.item : ''}
                    </div>
                ))}
            </div>

            <div className="workers-area">
                <div className="workers-column">
                    <h3>Produtores</h3>
                    {simulationState.producers.map(p => (
                        <div key={p.id} className={`worker producer ${p.state.toLowerCase()}`}>
                            Producer {p.id} ({p.state})
                        </div>
                    ))}
                </div>
                <div className="workers-column">
                    <h3>Consumidores</h3>
                    {simulationState.consumers.map(c => (
                        <div key={c.id} className={`worker consumer ${c.state.toLowerCase()}`}>
                            Consumer {c.id} ({c.state})
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProducerConsumer;
