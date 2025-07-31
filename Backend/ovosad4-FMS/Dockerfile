FROM python:3.13-slim

WORKDIR app

RUN apt-get update \
    && apt-get install -y --no-install-recommends locales \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY alembic.ini .
COPY alembic alembic

COPY app .

#CMD tail -f /dev/null
#CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0"]
