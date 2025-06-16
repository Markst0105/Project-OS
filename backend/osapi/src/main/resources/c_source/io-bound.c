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

    // Fill the buffer with some data
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

    const char* msg = "I/O-bound process finished.\n";
    write(STDOUT_FILENO, msg, strlen(msg));

    return 0;
}

