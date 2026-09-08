FROM mcr.microsoft.com/devcontainers/javascript-node:26-bookworm

USER root

# Install any native tools required by npm packages here.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER node