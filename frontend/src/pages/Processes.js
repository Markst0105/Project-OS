import React, { useState, useMemo } from 'react';
// Import components from the 'recharts' library
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import FeedbackSection from "../components/FeedbackSection";

function Processes() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const runProcess = async (processType) => {
        setIsLoading(true);
        setResults(null);
        try {
            const response = await fetch(`/api/processes/run/${processType}`);
            const data = await response.json();

            if (response.ok) {
                setResults(data);
            } else {
                setResults({ error: data.message || 'An error occurred on the server.' });
            }
        } catch (error) {
            setResults({ error: `Connection or parsing error: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // Transform the data into the format Recharts expects: an array of objects
    const transformedChartData = useMemo(() => {
        if (!results || !results.timeline || !results.cpuUsage) {
            return [];
        }
        return results.timeline.map((time, index) => ({
            time: time,
            cpu: results.cpuUsage[index]
        }));
    }, [results]);

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
                <div className="results-container" style={{marginTop: '2rem'}}>
                    <h3>Execution Results</h3>
                    {results.error ? (
                        <pre className="output-area error">{results.error}</pre>
                    ) : (
                        <>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem'}}>
                                <p><strong>Total Time (real):</strong> {results.realTime}</p>
                                <p><strong>Percent of CPU this job got:</strong> {results.cpuPercentage}%</p>
                                <p><strong>User CPU Time (user):</strong> {results.userTime}s</p>
                                <p><strong>Voluntary Context Switches:</strong> {results.voluntarySwitches}</p>
                                <p><strong>System/Kernel CPU Time (sys):</strong> {results.sysTime}s</p>
                                <p><strong>Involuntary Context Switches:</strong> {results.involuntarySwitches}</p>
                            </div>

                            <h4 style={{marginTop: '2rem'}}>Explanation</h4>
                            <p>{results.explanation}</p>

                            <div style={{width: '100%', height: 300, marginTop: '2rem'}}>
                                <ResponsiveContainer>
                                    <LineChart data={transformedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="cpu"
                                            name={`Mock CPU Usage (%)`}
                                            stroke={results.processType === 'cpu' ? '#ff6384' : '#36a2eb'}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            )}
            <FeedbackSection moduleName="processes"/>
        </div>
    );
}

export default Processes;