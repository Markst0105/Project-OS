# Step 1: Start from a standard, well-known Ubuntu base image.
FROM ubuntu:latest

# Step 2: Update the package manager and install our required tools in one command.
# - 'gcc' is the C compiler.
# - 'time' is the performance measurement utility.
# - '-y' flag accepts all installation prompts.
# - '&& rm...' is a cleanup step to keep the image small.
RUN apt-get update && apt-get install -y gcc time && rm -rf /var/lib/apt/lists/*

# Step 3: Set the working directory inside the container.
WORKDIR /app

# Step 4: A default placeholder command.
CMD ["/bin/sh"]