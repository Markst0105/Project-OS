// src/pages/SystemCalls.js
import React, { useState } from 'react';
// CORRECT: We import the component we want to use.
import FeedbackSection from '../components/FeedbackSection';

// This is the code for the *page*.
// The incorrect, pasted function has been removed.

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
    ssize_t bytes_written, bytes_read;

    // 1. cria/abre um arquivo (O_CREAT | O_WRONLY | O_TRUNC)
    fd = open("demo.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open() failed");
        exit(EXIT_FAILURE);
    }
    printf("Arquivo aberto com sucesso (fd = %d)\\n", fd);

    // 2. escrevo no arquivo
    const char *text = "Hello, Linux system calls\\n";
    bytes_written = write(fd, text, strlen(text));
    if (bytes_written == -1) {
        perror("write() failed");
        close(fd);
        exit(EXIT_FAILURE);
    }
    printf("Wrote %zd bytes to file\\n", bytes_written);

    // 3. fecha o aruivo
    close(fd);
    printf("File closed\\n");

    // 4. reabre o aruqivo para leitura
    fd = open("demo.txt", O_RDONLY);
    if (fd == -1) {
        perror("open() failed");
        exit(EXIT_FAILURE);
    }

    // 5. le o arquivo
    bytes_read = read(fd, buffer, sizeof(buffer) - 1);
    if (bytes_read == -1) {
        perror("read() failed");
        close(fd);
        exit(EXIT_FAILURE);
    }
    buffer[bytes_read] = '\\0'; // Null-terminate a string
    printf("Read %zd bytes: %s", bytes_read, buffer);

    // 6. fecha o arquivo novamente.
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
    pid_t pid;

    printf("Parent process started. PID: %d\\n", getpid());

    pid = fork(); //  cria novo processo

    if (pid < 0) {
        perror("Fork failed");
        exit(1); // exit com codigo 1
    } else if (pid == 0) {
        // Child process
        printf("Child process started. PID: %d\\n", getpid());
        printf("Child process executing 'ls' command using execvp().\\n");

        char *args[] = {"ls", "-l", NULL}; //  argumentos para execvp
        if (execvp("ls", args) == -1) {
            perror("Exec failed");
            exit(2); //  exit com codigo 2
        }
    } else {
        //  processo pai
        printf("Parent process waiting for child to finish.\\n");
        int status;
        wait(&status); //  wait ate o processo filho terminar

        if (WIFEXITED(status)) {
            printf("Child process exited with status: %d\\n", WEXITSTATUS(status));
        } else {
            printf("Child process did not exit normally.\\n");
        }

        printf("Parent process exiting successfully.\\n");
        exit(0); //  exit do codigo 0
    }

    return 0;
}`,
    'memory': `// system-call-memory.c
#include <stdio.h>
#include <unistd.h>
#include <sys/mman.h>
#include <string.h>

int main() {
    // exemplo de brk()
    // usado para alocar memoria
    void *initial_brk = sbrk(0);
    printf("Initial program break: %p\\n", initial_brk);

    // Increase program break
    if (brk(initial_brk + 4096) == 0) {
        printf("Increased program break by 4KB\\n");
    } else {
        perror("brk failed");
    }

    void *new_brk = sbrk(0);
    printf("New program break: %p\\n", new_brk);

    // exemplo de mmap()
    size_t mmap_size = 4096;
    void *mmap_area = mmap(NULL, mmap_size, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (mmap_area == MAP_FAILED) {
        perror("mmap failed");
        return 1;
    }
    printf("Memory mapped at: %p\\n", mmap_area);

    //  escreve na area de memoria mapeada
    strcpy((char *)mmap_area, "Hello, mmap!");
    printf("Data in mmap'd area: %s\\n", (char *)mmap_area);

    //  exemplo de mlock()
    if (mlock(mmap_area, mmap_size) == 0) {
        printf("Memory locked in RAM using mlock()\\n");
    } else {
        perror("mlock failed");
    }

    // limpando a area de memoria mapeada
    if (munmap(mmap_area, mmap_size) == 0) {
        printf("Memory unmapped successfully\\n");
    } else {
        perror("munmap failed");
    }

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

    const handleExecute = async () => {
        setIsLoading(true);
        setOutput('');

        try {
            const response = await fetch('/api/execute-c', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }),
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
            {/* CORRECT: Use the imported component as a JSX tag */}
            <FeedbackSection moduleName="system-calls" />
        </div>
    );
}

export default SystemCalls;