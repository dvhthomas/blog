# Alpine-based devcontainer for Hugo blog development
# Uses multi-stage build to avoid including Rust toolchain in final image

# Stage 1: Build oxipng from source
FROM rust:alpine AS oxipng-builder
RUN apk add --no-cache musl-dev
RUN cargo install oxipng --locked
# Binary will be at /usr/local/cargo/bin/oxipng

# Stage 2: Final development container
FROM golang:alpine

# Copy oxipng binary from builder stage
COPY --from=oxipng-builder /usr/local/cargo/bin/oxipng /usr/local/bin/oxipng

# Install base packages and development tools
RUN apk add --no-cache \
    # Shell and basics
    bash \
    bash-completion \
    curl \
    wget \
    git \
    openssh-client \
    ca-certificates \
    # Build essentials
    build-base \
    # Tools for blog workflow
    bc \
    chromium \
    pngquant \
    # Hugo extended
    hugo \
    # GitHub CLI
    github-cli \
    # go-task
    go-task \
    # For D2 diagram rendering
    fontconfig \
    ttf-dejavu \
    # Useful dev tools
    jq \
    less \
    vim \
    sudo \
    # GNU coreutils and search tools
    grep \
    findutils \
    gawk \
    ripgrep \
    tree

# Install D2
RUN curl -fsSL https://d2lang.com/install.sh | sh -s -- --prefix /usr/local

# Symlink go-task to task (Alpine package installs as go-task)
RUN ln -sf /usr/bin/go-task /usr/local/bin/task

# Create non-root user (devcontainer convention)
ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN addgroup -g $USER_GID $USERNAME && \
    adduser -D -u $USER_UID -G $USERNAME -s /bin/bash $USERNAME && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

ENV SHELL=/bin/bash
ENV GOPATH=/home/dev/go
ENV PATH=$PATH:/home/dev/go/bin

USER $USERNAME
WORKDIR /workspaces
