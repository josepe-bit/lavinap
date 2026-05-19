const pool = require('./src/config/db');

async function migrateTorneos() {
    const tables = [
        {
            name: 'Torneos',
            sql: `CREATE TABLE IF NOT EXISTS Torneos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE NOT NULL,
                detalle TEXT,
                estado ENUM('en_oferta', 'activo', 'terminado') DEFAULT 'en_oferta',
                min_equipos INT NOT NULL,
                puntos_ganador INT NOT NULL,
                val_inscripcion DECIMAL(12,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`
        },
        {
            name: 'Premios',
            sql: `CREATE TABLE IF NOT EXISTS Premios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                descripcion TEXT NOT NULL,
                valor DECIMAL(12,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'Equipos',
            sql: `CREATE TABLE IF NOT EXISTS Equipos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                torneo_id INT NOT NULL,
                cliente_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE,
                FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'JugaxEquipo',
            sql: `CREATE TABLE IF NOT EXISTS JugaxEquipo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                equipo_id INT NOT NULL,
                cliente_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE,
                FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'Grupos',
            sql: `CREATE TABLE IF NOT EXISTS Grupos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                torneo_id INT NOT NULL,
                numero_equipos INT NOT NULL,
                a_eliminar INT NOT NULL,
                estado ENUM('activo', 'inactivo') DEFAULT 'activo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'EquixGrupo',
            sql: `CREATE TABLE IF NOT EXISTS EquixGrupo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                grupo_id INT NOT NULL,
                equipo_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (grupo_id) REFERENCES Grupos(id) ON DELETE CASCADE,
                FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'FecxTorneo',
            sql: `CREATE TABLE IF NOT EXISTS FecxTorneo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero_partidos INT NOT NULL,
                fecha DATE NOT NULL,
                hora_inicio TIME NOT NULL,
                hora_fin TIME NOT NULL,
                torneo_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'ParxFecha',
            sql: `CREATE TABLE IF NOT EXISTS ParxFecha (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fec_torneo_id INT NOT NULL,
                equipo_id_local INT NOT NULL,
                grupo_id_local INT NOT NULL,
                puntos_local INT DEFAULT 0,
                equipo_id_vis INT NOT NULL,
                puntos_vis INT DEFAULT 0,
                grupo_id_vis INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fec_torneo_id) REFERENCES FecxTorneo(id) ON DELETE CASCADE,
                FOREIGN KEY (equipo_id_local) REFERENCES Equipos(id) ON DELETE CASCADE,
                FOREIGN KEY (grupo_id_local) REFERENCES Grupos(id) ON DELETE CASCADE,
                FOREIGN KEY (equipo_id_vis) REFERENCES Equipos(id) ON DELETE CASCADE,
                FOREIGN KEY (grupo_id_vis) REFERENCES Grupos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;`
        }
    ];

    for (const table of tables) {
        try {
            await pool.query(table.sql);
            console.log(`✅ Tabla ${table.name} creada exitosamente.`);
        } catch (e) {
            console.error(`❌ Error creando tabla ${table.name}:`, e.message);
        }
    }

    process.exit(0);
}

migrateTorneos();
