# ======================================================================
# Stage 1 : DEPENDENCIES
# ======================================================================
FROM python:3.12-slim AS deps

WORKDIR /build

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ======================================================================
# Stage 2 : RUNTIME
# ======================================================================
FROM python:3.12-slim

WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY app ./app
COPY alembic.ini .

LABEL maintainer="restauranthub" \ 
      service="service-analytics" \ 
      version="1.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \ 
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]