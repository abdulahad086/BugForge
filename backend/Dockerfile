# ==============================================================================
# STAGE 1: Builder
# ==============================================================================
FROM python:3.13-slim AS builder

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Create virtual environment for isolated dependency installation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency definition first to leverage Docker build cache
COPY requirements.txt .

# Install dependencies into virtualenv without pip caching to minimize size
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ==============================================================================
# STAGE 2: Production Runner
# ==============================================================================
FROM python:3.13-slim AS runner

# Set runtime environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Create non-root system user and group for security hardening
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false appuser

# Copy virtualenv from builder stage
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv

# Copy application source code
COPY --chown=appuser:appgroup . /app

# Switch to unprivileged non-root user
USER appuser

# Document exposed application port
EXPOSE 8000

# Exec form CMD for proper POSIX signal handling (SIGTERM / SIGINT)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
