FROM python:3.7-buster as base
FROM base as builder
RUN mkdir /install
WORKDIR /install
COPY requirements.txt /requirements.txt
RUN pip install --no-cache --prefix="/install" -r /requirements.txt
FROM base
COPY --from=builder /install /usr/local
COPY metadata.yaml ./
COPY training.db ./
CMD ["datasette", "serve", "--port", "8080", "--host", "0.0.0.0", "--metadata", "metadata.yaml", "training.db"]