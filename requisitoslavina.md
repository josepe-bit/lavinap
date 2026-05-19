Este es el Documento de Especificación de Requisitos del Software (ERS) para el sistema de gestión de la sede deportiva **"La Viña Canchas Sintéticas"**, integrado bajo el ecosistema del proyecto **Antigravity**.

---

# **Documento de Requisitos: Módulo de Gestión "La Viña" (Antigravity)**

## **1\. Introducción**

El objetivo de este desarrollo es proporcionar una plataforma integral para la reserva y administración de espacios deportivos y sociales. El sistema debe gestionar la disponibilidad inteligente de una cancha de fútbol 8 que se subdivide en dos de fútbol 5, además de un salón de eventos.

## **2\. Stack Tecnológico**

* **Base de Datos:** MySQL (Relacional para asegurar la integridad de las reservas).  
* **Backend:** Node.js (Runtime) con Express.  
* **Frontend:** React.js (Interfaz dinámica y Single Page Application).  
* **Arquitectura:** Cliente-Servidor con autenticación basada en JWT para el módulo administrativo.

## **3\. Requisitos Funcionales**

### **3.1 Gestión de Espacios y Disponibilidad Cruzada**

El sistema debe manejar una lógica de exclusividad para los siguientes recursos:

* **ID 1:** Cancha Fútbol 8\.  
* **ID 2:** Cancha Fútbol 5 (A).  
* **ID 3:** Cancha Fútbol 5 (B).

**Regla de Negocio:** Si el ID 1 está reservado en el bloque T, los IDs 2 y 3 quedan bloqueados automáticamente. Si el ID 2 o el ID 3 están reservados, el ID 1 queda bloqueado.

### **3.2 Proceso de Reserva (Usuario Normal)**

* **Formulario de Registro:** Para apartar cualquier servicio, se requieren obligatoriamente: Nombre, Documento de Identidad, Correo Electrónico, Celular y Valor del Abono.  
* **Cálculo de Costos:** El sistema debe multiplicar las horas reservadas por la tarifa vigente extraída de la tabla de configuraciones.  
* **Visualización de Calendario:** La Home debe mostrar un calendario interactivo con celdas de colores (ej. Verde: Disponible, Rojo: Ocupado). Los usuarios no administrativos solo pueden ver, no editar.

### **3.3 Módulo Administrativo (Dashboard)**

* **Autenticación:** Login seguro para administradores.  
* **Gestión de Catálogos:** CRUD (Crear, Leer, Actualizar, Borrar) de tarifas por hora y servicios.  
* **Confirmación de Reservas:** El administrador debe validar los abonos y confirmar los alquileres.  
* **Promociones y Mensajería:** Herramienta para publicar banners de descuentos o mensajes informativos que aparecerán en la vista del usuario general.

### **3.4 Información de Ubicación**

* Visualización estática de la dirección: *Carrera 11 \#19A LT 5 Barrio la Viña de Calambeo*.  
* Inserción de video instructivo ("Cómo llegar") visible en el área de cliente.

---

## **4\. Requisitos de Datos (Modelo de Entidad-Relación)**

| Tabla | Campos Principales |
| :---- | :---- |
| **Usuarios** | id, username, password (hash), rol |
| **Clientes** | id, nombre, documento, correo, celular |
| **Servicios** | id, nombre (Fútbol 8, Fútbol 5, Salón), descripción |
| **Tarifas** | id, id\_servicio, valor\_hora, fecha\_actualizacion |
| **Reservas** | id, id\_cliente, id\_servicio, fecha, hora\_inicio, hora\_fin, abono, estado (pendiente/confirmado)  |

mensajes	id, titulo, detalle  
---

## **5\. Diseño de Interfaz Sugerido (UX)**

* **Home:** Header con logo de Antigravity, seguido de un calendario de ocupación por columnas (Cancha 1, Cancha 2, Cancha 3, Salón).  
* **Footer:** Sección fija con la dirección en Calambeo y el video embebido.  
* **Panel Admin:** Sidebar con opciones de: *Monitor de Reservas, Ajuste de Precios, Mensajes del Sistema y Reportes.*

---

## **6\. Reglas de Validación**

1. No se permiten reservas con hora de fin menor a la hora de inicio.  
2. El sistema debe impedir el registro de una reserva si el cruce de canchas (F8 vs F5) está activo.  
3. El campo "Abono" debe ser numérico y validado antes de guardar la reserva como "Apartada".

