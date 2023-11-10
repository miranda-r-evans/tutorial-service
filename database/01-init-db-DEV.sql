DROP TYPE IF EXISTS tutorial
CREATE TABLE tutorial (
    id SERIAL PRIMARY KEY,
    heading VARCHAR,
    sections JSON,
    isTopLevel BOOLEAN,
    topParent INT references tutorial(id)
)