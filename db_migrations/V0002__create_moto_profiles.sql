CREATE TABLE moto_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  engine_cc INTEGER,
  color VARCHAR(100),
  vin VARCHAR(50),
  purchase_date DATE,
  purchase_km INTEGER DEFAULT 0,
  current_km INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO moto_profiles (name, brand, model, year, engine_cc, color, vin, purchase_km, current_km, is_active)
VALUES ('Мой GSX-S1000', 'Suzuki', 'GSX-S1000', 2022, 999, 'Glass Matte Mechanical Gray', 'JS1GT79A1N2100001', 0, 8450, TRUE);
