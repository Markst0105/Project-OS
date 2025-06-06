// src/pages/ProducerConsumer.js
import React, { useState, useEffect } from 'react';
import './ProducerConsumer.css'; // CSS específico para este componente

function ProducerConsumer() {
    const [numProducers, setNumProducers] = useState(2);
    const [numConsumers, setNumConsumers] = useState(2);
    const [bufferSize, setBufferSize] = useState(5);
    const [buffer, setBuffer] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    // Inicializa o buffer visual
    useEffect(() => {
        setBuffer(Array(bufferSize).fill({ state: 'empty', item: null }));
    }, [bufferSize]);

    const handleStart = () => {
        setIsRunning(true);
        // TODO: Chamar o endpoint do backend para iniciar a simulação.
        // O backend começaria a enviar atualizações do estado do buffer
        // (idealmente via WebSocket) que seriam capturadas aqui para
        // atualizar o estado 'buffer'.
        console.log("Iniciando simulação com:", { numProducers, numConsumers, bufferSize });

        // Simulação de exemplo no frontend para visualização:
        // A cada segundo, um produtor tenta adicionar um item.
        // Esta lógica DEVE ser movida para o backend.
        const interval = setInterval(() => {
            setBuffer(prevBuffer => {
                const newBuffer = [...prevBuffer];
                const emptyIndex = newBuffer.findIndex(slot => slot.state === 'empty');
                if (emptyIndex !== -1) {
                    newBuffer[emptyIndex] = { state: 'full', item: Math.floor(Math.random() * 100) };
                }
                return newBuffer;
            });
        }, 1000);

        // Limpeza ao parar a simulação
        return () => clearInterval(interval);
    };

    const handleStop = () => {
        setIsRunning(false);
        // TODO: Chamar endpoint para parar a simulação
    };

    return (
        <div>
            <h1>Módulo 3: Problema do Produtor-Consumidor</h1>
            <div className="control-panel">
                <label>Produtores: <input type="number" value={numProducers} onChange={e => setNumProducers(Number(e.target.value))} min="1" disabled={isRunning} /></label>
                <label>Consumidores: <input type="number" value={numConsumers} onChange={e => setNumConsumers(Number(e.target.value))} min="1" disabled={isRunning} /></label>
                <label>Tamanho do Buffer: <input type="number" value={bufferSize} onChange={e => setBufferSize(Number(e.target.value))} min="1" disabled={isRunning} /></label>
                <button onClick={handleStart} disabled={isRunning}>Iniciar</button>
                <button onClick={handleStop} disabled={!isRunning}>Parar</button>
            </div>

            <h3>Buffer</h3>
            <div className="buffer-container">
                {buffer.map((slot, index) => (
                    <div key={index} className={`buffer-slot ${slot.state}`}>
                        {slot.state === 'full' ? slot.item : ''}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProducerConsumer;