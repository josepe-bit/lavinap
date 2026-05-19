-- =============================================
-- La Viña - Canchas Sintéticas
-- Script de creación de Base de Datos
-- =============================================

CREATE DATABASE IF NOT EXISTS lavina_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lavina_db;

-- =============================================
-- Tabla: Usuarios (Administradores)
-- =============================================
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Clientes
-- =============================================
CREATE TABLE IF NOT EXISTS Clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    documento VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(200),
    celular VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Servicios
-- =============================================
CREATE TABLE IF NOT EXISTS Servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Tarifas
-- =============================================
CREATE TABLE IF NOT EXISTS Tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    valor_hora DECIMAL(12,2) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_servicio) REFERENCES Servicios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Reservas
-- =============================================
CREATE TABLE IF NOT EXISTS Reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    abono DECIMAL(12,2) DEFAULT 0,
    estado ENUM('pendiente', 'confirmado', 'cancelado') DEFAULT 'pendiente',
    grupo_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES Servicios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Mensajes (Promociones / Notificaciones)
-- =============================================
CREATE TABLE IF NOT EXISTS Mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    detalle TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Torneos
-- =============================================
CREATE TABLE IF NOT EXISTS Torneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    detalle TEXT,
    estado ENUM('en_oferta', 'activo', 'terminado') DEFAULT 'en_oferta',
    min_equipos INT NOT NULL,
    puntos_ganador INT NOT NULL,
    val_inscripcion DECIMAL(12,2) NOT NULL,
    jugadoresxequipo INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Premios
-- =============================================
CREATE TABLE IF NOT EXISTS Premios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    torneo_id INT NOT NULL,
    descripcion TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Equipos
-- =============================================
CREATE TABLE IF NOT EXISTS Equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    torneo_id INT NOT NULL,
    cliente_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: JugaxEquipo
-- =============================================
CREATE TABLE IF NOT EXISTS JugaxEquipo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    cliente_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: Grupos
-- =============================================
CREATE TABLE IF NOT EXISTS Grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    torneo_id INT NOT NULL,
    numero_equipos INT NOT NULL,
    a_eliminar INT NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: EquixGrupo
-- =============================================
CREATE TABLE IF NOT EXISTS EquixGrupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    equipo_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES Grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: FecxTorneo
-- =============================================
CREATE TABLE IF NOT EXISTS FecxTorneo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_partidos INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    torneo_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Tabla: ParxFecha
-- =============================================
CREATE TABLE IF NOT EXISTS ParxFecha (
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
) ENGINE=InnoDB;

-- =============================================
-- DATOS INICIALES (Seeds)
-- =============================================

-- Usuario admin por defecto (password: admin123)
-- Hash bcrypt de "admin123"
INSERT INTO Usuarios (username, password, rol) VALUES
('admin', '$2b$10$EoP9qWU1qoelUCZvotI6WeAspWvldC2rmCbOOyRVkSKcXZmuup5bi', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Servicios base
INSERT INTO Servicios (id, nombre, descripcion) VALUES
(1, 'Fútbol 8', 'Cancha de fútbol 8 - Césped sintético de última generación'),
(2, 'Fútbol 5 (A)', 'Cancha de fútbol 5 lado A - Subdivisión de la cancha principal'),
(3, 'Fútbol 5 (B)', 'Cancha de fútbol 5 lado B - Subdivisión de la cancha principal'),
(4, 'Salón de Eventos', 'Salón para eventos sociales y celebraciones')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tarifas iniciales
INSERT INTO Tarifas (id_servicio, valor_hora) VALUES
(1, 120000),
(2, 70000),
(3, 70000),
(4, 80000)
ON DUPLICATE KEY UPDATE valor_hora = VALUES(valor_hora);

-- Mensaje de bienvenida
INSERT INTO Mensajes (titulo, detalle, activo) VALUES
('¡Bienvenidos a La Viña!', 'Reserva tu cancha favorita y disfruta del mejor fútbol en la ciudad. ¡Te esperamos!', true);

SELECT '✅ Base de datos lavina_db creada exitosamente con todos los datos iniciales.' AS resultado;
