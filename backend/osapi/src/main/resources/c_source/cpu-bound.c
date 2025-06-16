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

    for (long long i = 0; i < 1e8; i++) {
        result += custom_sqrt(i); //  faz um calculo intensivo de CPU
    }

    double_to_string(result, buffer, sizeof(buffer));
    write(STDOUT_FILENO, "Final result: ", 14);
    write(STDOUT_FILENO, buffer, strlen(buffer));
    write(STDOUT_FILENO, "\n", 1);

    return 0;
}