// src/pages/Processes.js
import React, { useState } from 'react';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Processes() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    // Função para chamar o backend e executar um tipo de processo
    const runProcess = async (processType) => {
        setIsLoading(true);
        setResults(null);
        try {
            // O backend Java terá um endpoint para rodar os processos pré-definidos
            const response = await fetch(`http://localhost:8080/api/processes/run/${processType}`);
            const data = await response.json();

            if (response.ok) {
                setResults(data);
            } else {
                setResults({ error: data.message || 'Ocorreu um erro no servidor.' });
            }
        } catch (error) {
            setResults({ error: `Erro de conexão: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // Dados de exemplo para o gráfico - você vai preencher isso com os dados do backend
    const chartData = {
        labels: results?.timeline || [], // Eixo X: Tempo
        datasets: [
            {
                label: 'Uso de CPU (%)',
                data: results?.cpuUsage || [], // Eixo Y: Uso de CPU
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return (
        <div>
            <h1>Módulo 2: Processos CPU-bound e I/O-bound</h1>
            <p>Selecione um tipo de processo para executar no servidor e visualizar seu comportamento.</p>

            <div className="control-panel">
                <button onClick={() => runProcess('cpu')} disabled={isLoading}>
                    Executar CPU-Bound
                </button>
                <button onClick={() => runProcess('io')} disabled={isLoading}>
                    Executar I/O-Bound
                </button>
            </div>

            {isLoading && <p>Executando, por favor aguarde...</p>}

            {results && (
                <div className="results-container">
                    <h3>Resultados da Execução</h3>
                    {results.error ? (
                        <pre className="output-area error">{results.error}</pre>
                    ) : (
                        <>
                            <p><strong>Tempo Real:</strong> {results.realTime}s</p>
                            <p><strong>Tempo de Usuário (CPU):</strong> {results.userTime}s</p>
                            <p><strong>Tempo de Sistema (Kernel):</strong> {results.sysTime}s</p>
                            <div style={{height: '400px', marginTop: '2rem'}}>
                                <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                            </div>
                            <h4>Explicação</h4>
                            <p>{results.explanation}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Processes;