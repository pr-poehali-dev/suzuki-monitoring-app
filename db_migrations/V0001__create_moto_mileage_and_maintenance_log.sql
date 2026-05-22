
CREATE TABLE moto_mileage (
  id SERIAL PRIMARY KEY,
  km INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO moto_mileage (km) VALUES (8450);

CREATE TABLE moto_maintenance_log (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(255) NOT NULL,
  done_km INTEGER NOT NULL DEFAULT 0,
  done_date DATE NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);
