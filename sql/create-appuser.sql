-- ============================================
-- Tabla AppUser para autenticación del dashboard GAM
-- Base de datos: AMDCGAM
-- ============================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppUser')
BEGIN
  CREATE TABLE AppUser (
    AppUserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'operador',
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UltimoAcceso DATETIME NULL
  )

  PRINT 'Tabla AppUser creada exitosamente'
END
ELSE
BEGIN
  PRINT 'Tabla AppUser ya existe'
END
GO

-- ============================================
-- Seed: usuarios iniciales
-- Passwords hasheadas con bcrypt (10 rounds)
-- admin123 => $2b$10$rQZKjGxKg5K5K5K5K5K5KuYJ8qH8qH8qH8qH8qH8qH8qH8qH8q
-- oper123  => $2b$10$rQZKjGxKg5K5K5K5K5K5KuYJ8qH8qH8qH8qH8qH8qH8qH8qH8q
-- NOTA: Los hashes reales se generan al ejecutar el seed desde la app
-- Estos son placeholders - usar el endpoint POST /api/users para crear
-- ============================================

-- Insertar admin si no existe
IF NOT EXISTS (SELECT 1 FROM AppUser WHERE Username = 'admin')
BEGIN
  -- Hash para 'admin123' generado con bcrypt 10 rounds
  INSERT INTO AppUser (Username, PasswordHash, Nombre, Role, Activo)
  VALUES ('admin', '$2b$10$placeholder_run_seed_endpoint', 'Administrador', 'admin', 1)
  PRINT 'Usuario admin insertado (necesita re-hash via seed endpoint)'
END

-- Insertar operador si no existe
IF NOT EXISTS (SELECT 1 FROM AppUser WHERE Username = 'operador')
BEGIN
  INSERT INTO AppUser (Username, PasswordHash, Nombre, Role, Activo)
  VALUES ('operador', '$2b$10$placeholder_run_seed_endpoint', 'Operador GAM', 'operador', 1)
  PRINT 'Usuario operador insertado (necesita re-hash via seed endpoint)'
END
GO
