import React, { useState } from 'react';

// Um mapa com os códigos de exemplo que você forneceu
const codeExamples = {
    'file-io': `// system-call-file.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>

int main() {
    int fd;
    char buffer[100];
    const char *text = "Hello, world!";
    
    fd = open("test.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    write(fd, text, strlen(text));
    close(fd);

    fd = open("test.txt", O_RDONLY);
    ssize_t bytes_read = read(fd, buffer, sizeof(buffer)-1);
    buffer[bytes_read] = '\\0';
    printf("Lido do arquivo: %s\\n", buffer);
    close(fd);
    
    return 0;
}`,
    'process': `// system-call-process.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) { // Processo filho
        printf("Eu sou o processo filho!\\n");
        exit(0);
    } else { // Processo pai
        printf("Eu sou o processo pai, esperando o filho...\\n");
        wait(NULL);
        printf("Processo filho terminou.\\n");
    }
    return 0;
}`,
    'memory': `// system-call-memory.c
#include <stdio.h>
#include <unistd.h>

int main() {
    void *initial_brk = sbrk(0);
    printf("Ponteiro de heap inicial: %p\\n", initial_brk);
    brk(initial_brk + 4096);
    void *new_brk = sbrk(0);
    printf("Novo ponteiro de heap: %p\\n", new_brk);
    return 0;
}`
};

function SystemCalls() {
    const [selectedExample, setSelectedExample] = useState('file-io');
    const [code, setCode] = useState(codeExamples[selectedExample]);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleExampleChange = (e) => {
        const key = e.target.value;
        setSelectedExample(key);
        setCode(codeExamples[key]);
    };

    // Esta função irá chamar o seu backend
    const handleExecute = async () => {
        setIsLoading(true);
        setOutput('');

        try {
            // A URL do seu endpoint no backend (ex: Java/Spring Boot)
            const response = await fetch('http://localhost:8080/api/execute-c', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }), // Envia o código como JSON
            });

            const result = await response.json();

            if (response.ok) {
                setOutput(`Saída Padrão:\n${result.stdout}\n\nErros:\n${result.stderr}`);
            } else {
                setOutput(`Erro do servidor: ${result.message}`);
            }
        } catch (error) {
            setOutput(`Erro de conexão: Não foi possível conectar ao backend. Verifique se ele está rodando.\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Módulo 1: Chamadas de Sistema</h1>
            <p>Escolha um exemplo, edite o código se desejar e execute-o no servidor.</p>

            <div className="control-panel">
                <select value={selectedExample} onChange={handleExampleChange}>
                    <option value="file-io">E/S de Arquivo (open, read, write, close)</option>
                    <option value="process">Processos (fork, wait, exit)</option>
                    <option value="memory">Memória (brk, sbrk)</option>
                </select>
                <button onClick={handleExecute} disabled={isLoading}>
                    {isLoading ? 'Executando...' : 'Compilar e Executar'}
                </button>
            </div>

            <div className="editor-container">
        <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
        />
                <pre className="output-area">
          <code>{output || 'A saída do programa aparecerá aqui...'}</code>
        </pre>
            </div>
        </div>
    );
}

export default SystemCalls;