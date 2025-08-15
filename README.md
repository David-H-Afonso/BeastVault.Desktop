# Beast Vault - Aplicación de Escritorio

Una aplicación completa de Beast Vault que permite gestionar archivos .pk\* de forma local, sin necesidad de configuración técnica.

## Legal Disclaimer

**Beast Vault** is an independent, non-commercial, open-source project for personal use. It is **NOT** affiliated, associated, endorsed, sponsored, or approved by Nintendo, The Pokémon Company, Game Freak, Creatures Inc., or any of their subsidiaries, affiliates, or partners. All trademarks, service marks, trade names, product names, and trade dress mentioned or referenced within this project are the property of their respective owners.

This software is **not an official Pokémon product** and does not attempt to simulate, emulate, reproduce, replace, or provide any product, service, or functionality of official Pokémon games, services, or hardware. Any similarity to proprietary formats, terminology, or concepts is purely for descriptive purposes and does not imply endorsement or association.

**Beast Vault** is intended solely for lawful, personal-use management and storage of legitimately obtained Pokémon data files (e.g., `.pk*` formats) that belong to the user. The project does **NOT**:

- Provide or facilitate the creation, modification, or acquisition of Pokémon.
- Distribute or include copyrighted game assets, code, or data belonging to Nintendo or The Pokémon Company.
- Encourage, promote, or support any activity that violates applicable laws, the Pokémon games’ End User License Agreements (EULAs), or the terms of service of official products or platforms.

Use of this software is entirely at the user’s own risk. The authors and contributors disclaim any and all responsibility and liability for misuse, infringement, or violation of third-party rights. By using this software, the user agrees to comply with all applicable laws, regulations, and contractual obligations.

## 🚀 Construcción y Distribución

### Requisitos Previos

- **Node.js** (versión 18 o superior): [Descargar](https://nodejs.org/)
- **.NET 9 SDK**: [Descargar](https://dotnet.microsoft.com/download)

### Construcción Rápida

**Windows PowerShell:**

```powershell
# Build para desarrollo
.\build.ps1 -Dev

# Build para distribución
.\build.ps1 -Release
```

**Windows Batch:**

```batch
# Construir y crear ejecutable
build.bat
```

### Construcción Manual

1. **Instalar dependencias:**

```bash
# Electron
cd BeastVault.Desktop
npm install

# Frontend
cd ../BeastVault.Front
npm install
```

2. **Construir Frontend:**

```bash
cd BeastVault.Front
npm run build
```

3. **Construir Backend:**

```bash
cd BeastVault.Api
dotnet publish -c Release -o ../BeastVault.Desktop/dist/backend
```

4. **Crear ejecutable:**

```bash
cd BeastVault.Desktop
npm run dist
```

## 📁 Estructura de Archivos para el Usuario Final

La aplicación crea automáticamente las siguientes carpetas:

- **Storage de Pokemon**: `Documents/BeastVault/Storage/`

  - Aquí se guardan todos los archivos .pk\* de los Pokemon
  - Los usuarios pueden acceder fácilmente a esta carpeta

- **Base de Datos**: `%APPDATA%/Beast Vault/`
  - Base de datos SQLite con la información indexada
  - Datos privados de la aplicación

## 🎯 Características

- **Instalación Simple**: Un único ejecutable .exe
- **Sin Configuración**: La aplicación se configura automáticamente
- **Rutas Dinámicas**: Detecta automáticamente las carpetas del usuario
- **Backend Local**: API REST local en puerto dinámico
- **Frontend Integrado**: Interfaz React embebida
- **Migración Automática**: Base de datos se actualiza automáticamente

## 🔧 Desarrollo

### Modo Desarrollo

```bash
# Terminal 1: Backend
cd BeastVault.Api
dotnet run

# Terminal 2: Frontend
cd BeastVault.Front
npm run dev

# Terminal 3: Electron
cd BeastVault.Desktop
npm run dev
```

### Variables de Entorno para Electron

El proceso principal de Electron establece:

- `STORAGE_PATH`: Ruta al almacenamiento de Pokemon
- `DB_PATH`: Ruta a la base de datos
- `ASPNETCORE_URLS`: URL del backend API

## 📦 Distribución

El comando `npm run dist` crea:

- `./release/Beast Vault Setup.exe` - Instalador NSIS
- `./release/win-unpacked/` - Aplicación portable

### Configuración del Instalador

El instalador NSIS incluye:

- Instalación en Program Files
- Accesos directos en Escritorio y Menú Inicio
- Desinstalador automático
- Detección de dependencias

## 🛠️ Solución de Problemas

### El backend no inicia

- Verificar que el puerto esté libre
- Comprobar permisos de escritura en las carpetas
- Revisar logs en la consola de Electron

### El frontend no carga

- Verificar que los archivos estén en `dist/frontend/`
- Comprobar la configuración de CORS en el backend

### Base de datos no se crea

- Verificar permisos en `%APPDATA%`
- Comprobar que SQLite esté disponible

## 📋 TODO

- [ ] Agregar iconos personalizados
- [ ] Implementar auto-actualizador
- [ ] Crear instalador macOS/Linux
- [ ] Añadir logging avanzado
- [ ] Implementar backup automático
