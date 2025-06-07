# Use the official GCC image as a base
FROM gcc:latest

# Switch to the root user to be able to install packages
USER root

# Run the command to update package lists and install the 'time' utility
# The -y flag automatically answers 'yes' to prompts
# The '&& rm...' part is good practice to keep the final image smaller
RUN apt-get update && \
    apt-get install -y --reinstall time && \
    rm -rf /var/lib/apt/lists/* && \
    # Verify installation
    [ -f /usr/bin/time ] || { echo "time not installed!"; exit 1; } && \
    /usr/bin/time --version

# Create a working directory for our application code
WORKDIR /app

# A default command placeholder (not critical for our use case)
CMD ["/bin/sh"]