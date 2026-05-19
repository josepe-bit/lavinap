USE lavina_db;

-- Agregar campo utilizada a Reservas
ALTER TABLE Reservas ADD COLUMN utilizada BOOLEAN DEFAULT FALSE;

-- Tabla de canjes de promoción
CREATE TABLE IF NOT EXISTS Canjes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    tipo_cancha ENUM('futbol8','futbol5') NOT NULL,
    fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT 'Migración completada exitosamente' AS resultado;
