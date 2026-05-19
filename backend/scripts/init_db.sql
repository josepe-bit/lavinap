-- MySQL Script for La Viña

CREATE DATABASE IF NOT EXISTS lavina_db;
USE lavina_db;

-- Usuarios (Administradores)
CREATE TABLE IF NOT EXISTS Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin'
);

-- Clientes
CREATE TABLE IF NOT EXISTS Clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(20) NOT NULL UNIQUE,
  correo VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL
);

-- Servicios (Canchas y Salones)
CREATE TABLE IF NOT EXISTS Servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT
);

-- Tarifas
CREATE TABLE IF NOT EXISTS Tarifas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_servicio INT NOT NULL,
  valor_hora DECIMAL(10,2) NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_servicio) REFERENCES Servicios(id) ON DELETE CASCADE
);

-- Reservas
CREATE TABLE IF NOT EXISTS Reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_servicio INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  abono DECIMAL(10,2) DEFAULT 0.00,
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada') DEFAULT 'Pendiente',
  grupo_id VARCHAR(50) NULL,
  FOREIGN KEY (id_cliente) REFERENCES Clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_servicio) REFERENCES Servicios(id) ON DELETE CASCADE
);

-- Mensajes / Promociones
CREATE TABLE IF NOT EXISTS Mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  detalle TEXT NOT NULL,
  activo BOOLEAN DEFAULT true
);

-- Torneos
CREATE TABLE IF NOT EXISTS Torneos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  detalle TEXT,
  estado ENUM('en_oferta', 'activo', 'terminado') DEFAULT 'en_oferta',
  min_equipos INT NOT NULL,
  puntos_ganador INT NOT NULL,
  val_inscripcion DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premios
CREATE TABLE IF NOT EXISTS Premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  torneo_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
);

-- Equipos
CREATE TABLE IF NOT EXISTS Equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  torneo_id INT NOT NULL,
  cliente_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
);

-- JugaxEquipo
CREATE TABLE IF NOT EXISTS JugaxEquipo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT NOT NULL,
  cliente_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE
);

-- Grupos
CREATE TABLE IF NOT EXISTS Grupos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  torneo_id INT NOT NULL,
  numero_equipos INT NOT NULL,
  a_eliminar INT NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
);

-- EquixGrupo
CREATE TABLE IF NOT EXISTS EquixGrupo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grupo_id INT NOT NULL,
  equipo_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES Grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE
);

-- FecxTorneo
CREATE TABLE IF NOT EXISTS FecxTorneo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_partidos INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  torneo_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (torneo_id) REFERENCES Torneos(id) ON DELETE CASCADE
);

-- ParxFecha
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
);

-- Datos iniciales de prueba (Servicios)
INSERT IGNORE INTO Servicios (id, nombre, descripcion) VALUES (1, 'Fútbol 8', 'Cancha principal de césped sintético para fútbol 8.');
INSERT IGNORE INTO Servicios (id, nombre, descripcion) VALUES (2, 'Fútbol 5 (A)', 'Subdivisión A de la cancha principal.');
INSERT IGNORE INTO Servicios (id, nombre, descripcion) VALUES (3, 'Fútbol 5 (B)', 'Subdivisión B de la cancha principal.');
INSERT IGNORE INTO Servicios (id, nombre, descripcion) VALUES (4, 'Salón Eventos', 'Espacio social para celebraciones.');

-- Insertar un administrador por defecto (password: 'admin123' hasheado con bcrypt, salt=10)
-- El hash generado corresponde a 'admin123'
INSERT IGNORE INTO Usuarios (username, password, rol) VALUES ('admin', '$2b$10$wWzfa7fZoBb0AUiDJuLq6.u.zYsFH8Vn.fMnS012txSHbytfPBNbe', 'admin');
