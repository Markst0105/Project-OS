import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

console.log("🧪 typeof Line:", typeof Line); // function
console.log("🧪 is React element:", React.isValidElement(Line)); // false (because it's a component)

function Processes() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const runProcess = async (processType) => {
        setIsLoading(true);
        setResults(null);
        try {
            const response = await fetch(`http://localhost:8080/api/processes/run/${processType}`);
            const data = await response.json();

            if (response.ok) {
                setResults({
                    processType,
                    realTime: data.realTime || "N/A",
                    userTime: data.userTime || "N/A",
                    sysTime: data.sysTime || "N/A",
                    cpuPercentage: data.cpuPercentage || "N/A",
                    voluntarySwitches: data.voluntarySwitches || "N/A",
                    involuntarySwitches: data.involuntarySwitches || "N/A",
                    timeline: data.timeline || [],
                    cpuUsage: data.cpuUsage || [],
                    explanation: data.explanation || 'No explanation provided'
                });
            } else {
                setResults({
                    error: data.message || 'An error occurred on the server.'
                });
            }
        } catch (error) {
            setResults({
                error: `Connection or parsing error: ${error.message}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'CPU Usage (%)'
                }
            }
        }
    };

    const chartData = results ? {
        labels: results.timeline || [],
        datasets: [
            {
                label: `CPU Usage for ${results.processType}-bound process (%)`,
                data: results.cpuUsage || [],
                borderColor: results.processType === 'cpu' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)',
                backgroundColor: results.processType === 'cpu' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)',
            },
        ],
    } : null;

    if (chartData) {
        const dataset = chartData.datasets[0];
        console.log("🧪 chartData.datasets[0].data:", dataset.data);
        console.log("🧪 chartData.datasets[0].data types:", dataset.data.map(d => typeof d));
        console.log("🧪 explanation type:", typeof results.explanation);
        console.log("🧪 explanation:", results.explanation);
        const d = chartData.datasets[0].data;
        const l = chartData.labels;
        console.log("🧪 final chart data types:", d.map((x, i) => [i, typeof x, x]));
        console.log("🧪 final labels:", l);
    }

    if (chartOptions) {
        console.log("🧪 chartOptions type:", typeof chartOptions);
        console.log("🧪 chartOptions keys:", Object.keys(chartOptions));
    }

    return (
        <div>
            <h1>Módulo 2: Processos CPU-bound e I/O-bound</h1>
            <p>Select a process type to execute on the server and visualize its behavior.</p>

            <div className="control-panel">
                <button onClick={() => runProcess('cpu')} disabled={isLoading}>
                    {isLoading ? 'Running...' : 'Run CPU-Bound Process'}
                </button>
                <button onClick={() => runProcess('io')} disabled={isLoading}>
                    {isLoading ? 'Running...' : 'Run I/O-Bound Process'}
                </button>
            </div>

            {isLoading && <p>Executing, please wait...</p>}

            {results && (
                <div className="results-container" style={{ marginTop: '2rem' }}>
                    <h3>Execution Results</h3>
                    {results.error ? (
                        <pre className="output-area error">{results.error}</pre>
                    ) : (
                        <>
                            <div className="metrics-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <p><strong>Total Time (real):</strong> {results.realTime}</p>
                                    <p><strong>User CPU Time (user):</strong> {results.userTime}</p>
                                    <p><strong>System/Kernel CPU Time (sys):</strong> {results.sysTime}</p>
                                </div>
                                <div>
                                    <p><strong>CPU Percentage:</strong> {results.cpuPercentage}%</p>
                                    <p><strong>Voluntary Context Switches:</strong> {results.voluntarySwitches}</p>
                                    <p><strong>Involuntary Context Switches:</strong> {results.involuntarySwitches}</p>
                                </div>
                            </div>

                            <h4>Explanation</h4>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {typeof results.explanation === 'string'
                                    ? results.explanation
                                    : JSON.stringify(results.explanation)}
                            </div>

                            {Array.isArray(results.cpuUsage) && results.cpuUsage.length > 0 && chartData && (
                                <div style={{ position: 'relative', height: '40vh', marginTop: '2rem' }}>
                                    {typeof Line === 'function' ? (
                                        <Line data={chartData} options={chartOptions} />
                                    ) : (
                                        <p>Chart component not available</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Processes;