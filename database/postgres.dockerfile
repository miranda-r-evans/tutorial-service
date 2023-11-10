FROM postgres

LABEL description="Postgres db for tutorial service"

COPY *.sql /docker-entrypoint-initdb.d/