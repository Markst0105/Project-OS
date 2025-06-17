import React, { useState, useMemo } from 'react';
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

// The C source code is stored here as string constants for display.
const sourceCodes = {
    cpu: `// cpu-bound.c
#include <stdio.h>
#include <math.h>
#include <unistd.h>
#include <string.h>

// raiz quadrada usando o método de Babilônia
double custom_sqrt(double x) {
    double guess = x / 2.0;
    double epsilon = 1e-6;
    while ((guess * guess - x) > epsilon || (x - guess * guess) > epsilon) {
        guess = (guess + x / guess) / 2.0;
    }
    return guess;
}

//  convertendo double para string
void double_to_string(double value, char *buffer, int buffer_size) {
    int len = snprintf(buffer, buffer_size, "%f", value);
    if (len >= buffer_size) {
        buffer[buffer_size - 1] = '\0'; //  garante terminacao null
    }
}

//  programa exemplo de tarefa CPU-bound
//  faz o calculo e imprime o resultado no stdout
int main() {
    volatile double result = 0.0; //  uso de volatile para evitar otimizações do compilador
    char buffer[64];

    for (long long i = 0; i < 1e7; i++) {
        result += custom_sqrt(i); //  faz um calculo intensivo de CPU
    }

    double_to_string(result, buffer, sizeof(buffer));
    write(STDOUT_FILENO, "Final result: ", 14);
    write(STDOUT_FILENO, buffer, strlen(buffer));
    write(STDOUT_FILENO, "\n", 1);

    return 0;
}
}`,
    io: `// io-bound.c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// We will write 4KB chunks multiple times.
#define BUFFER_SIZE 4096
#define NUM_WRITES 2560 // 2560 writes * 4KB/write = 10MB total data

int main() {
    int fd;
    char buffer[BUFFER_SIZE];
    ssize_t bytes_written;

    // Fill the buffer with some meaningless data
    memset(buffer, 'X', BUFFER_SIZE);

    // Open the output file for writing.
    // O_SYNC is the critical flag: It forces every write to wait for
    // the physical disk, making the process wait (I/O bound).
    fd = open("io_test_file.dat", O_WRONLY | O_CREAT | O_TRUNC | O_SYNC, 0644);
    if (fd < 0) {
        perror("Error opening output file");
        exit(EXIT_FAILURE);
    }

    // Write 10MB of data to the file, forcing a sync on each write.
    for (int i = 0; i < NUM_WRITES; i++) {
        bytes_written = write(fd, buffer, BUFFER_SIZE);
        if (bytes_written != BUFFER_SIZE) {
            perror("Error writing to output file");
            close(fd);
            exit(EXIT_FAILURE);
        }
    }

    // Clean up
    close(fd);
    unlink("io_test_file.dat"); // Delete the test file

    const char* msg = "I/O-bound process finished.\\n";
    write(STDOUT_FILENO, msg, strlen(msg));

    return 0;
}`
};


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

                            {/* --- NEW SECTION TO DISPLAY SOURCE CODE --- */}
                            <div className="source-code-container" style={{marginTop: '2rem'}}>
                                <h4>Source Code Executed</h4>
                                <pre className="code-block">
                  <code>
                    {sourceCodes[results.processType]}
                  </code>
                </pre>
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
