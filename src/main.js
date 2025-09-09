const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev =
  process.argv.includes("--dev") || process.env.NODE_ENV === "development";
const os = require("os");
const fs = require("fs");
const findFreePort = require("find-free-port");

console.log("🚀 Iniciando BeastVault...");
console.log("📍 Modo:", isDev ? "Desarrollo" : "Producción");
console.log("📂 __dirname:", __dirname);
console.log("📂 process.resourcesPath:", process.resourcesPath);
console.log("📂 app.getAppPath():", app.getAppPath());

let mainWindow;
let backendProcess;
let frontendUrl;
let apiPort;

// Configurar rutas de datos del usuario
const userDataPath = app.getPath("userData");
const documentsPath = app.getPath("documents");
const beastVaultPath = path.join(documentsPath, "BeastVault");
const backupPath = path.join(beastVaultPath, "backup");
const dbPath = path.join(userDataPath, "beastvault.db");

// Crear directorios necesarios
function ensureDirectories() {
  if (!fs.existsSync(beastVaultPath)) {
    fs.mkdirSync(beastVaultPath, { recursive: true });
  }
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
}

// Encontrar puerto libre para el backend
async function findAvailablePort() {
  // Usar puerto fijo para backend: 5000
  return 5000;
}

// Iniciar backend
async function startBackend() {
  return new Promise(async (resolve, reject) => {
    try {
      apiPort = await findAvailablePort();

      let backendPath;
      if (isDev) {
        // En desarrollo, usar dotnet run
        backendPath = path.join(__dirname, "..", "..", "BeastVault.Api");
        backendProcess = spawn("dotnet", ["run"], {
          cwd: backendPath,
          env: {
            ...process.env,
            ASPNETCORE_URLS: `http://localhost:5000`,
            STORAGE_PATH: beastVaultPath,
            DB_PATH: dbPath,
            ASPNETCORE_ENVIRONMENT: "Development",
          },
        });
      } else {
        // En producción, usar el ejecutable compilado
        backendPath = path.join(
          process.resourcesPath,
          "backend",
          "BeastVault.Api.exe"
        );
        backendProcess = spawn(backendPath, [], {
          env: {
            ...process.env,
            ASPNETCORE_URLS: `http://localhost:5000`,
            STORAGE_PATH: beastVaultPath,
            DB_PATH: dbPath,
            ASPNETCORE_ENVIRONMENT: "Production",
          },
        });
      }

      backendProcess.stdout.on("data", (data) => {
        console.log(`Backend: ${data}`);
        if (data.toString().includes("Now listening on")) {
          resolve();
        }
      });

      backendProcess.stderr.on("data", (data) => {
        console.error(`Backend Error: ${data}`);
      });

      backendProcess.on("close", (code) => {
        console.log(`Backend process exited with code ${code}`);
      });

      // Timeout de seguridad
      setTimeout(() => resolve(), 10000);
    } catch (error) {
      reject(error);
    }
  });
}

// Configurar frontend
async function setupFrontend() {
  console.log("🎨 Configurando frontend...");

  if (isDev) {
    // En desarrollo, usar Vite dev server
    console.log("🔧 Modo desarrollo: iniciando Vite dev server");
    frontendUrl = "http://localhost:5173";
    const frontendPath = path.join(__dirname, "..", "..", "BeastVault.Front");
    console.log("📂 Ruta frontend:", frontendPath);

    spawn("npm", ["run", "dev"], {
      cwd: frontendPath,
      shell: true,
    });

    // Esperar a que Vite esté listo
    await waitForServer("http://localhost:5173", 30000);
  } else {
    // En producción, usar servidor HTTP simple
    console.log("📦 Modo producción: iniciando servidor HTTP local");
    const frontendDir = path.join(process.resourcesPath, "frontend");
    console.log("📂 Directorio frontend:", frontendDir);
    console.log("📁 Frontend existe:", fs.existsSync(frontendDir));

    if (fs.existsSync(frontendDir)) {
      const files = fs.readdirSync(frontendDir);
      console.log("📄 Archivos en frontend:", files);

      // Iniciar servidor HTTP simple
      const frontendPort = 5173; // Puerto fijo para frontend
      await startStaticServer(frontendDir, frontendPort, apiPort);
      frontendUrl = `http://localhost:${frontendPort}`;
      console.log("🌐 Frontend URL:", frontendUrl);
    } else {
      throw new Error("Frontend directory not found");
    }
  }
}

// Servidor HTTP simple para archivos estáticos
function startStaticServer(directory, port, apiPortParam) {
  return new Promise((resolve, reject) => {
    const http = require("http");
    const url = require("url");
    const mime = require("path").extname;

    const mimeTypes = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".ico": "image/x-icon",
      ".svg": "image/svg+xml",
    };

    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url);
      let pathname = path.join(directory, parsedUrl.pathname);

      // Manejar config.js específicamente para Electron
      if (parsedUrl.pathname === "/config.js") {
        const configContent = `
// Configuración para Electron
window.ENV = {
  VITE_API_URL: 'http://localhost:${apiPortParam || 5000}'
};
console.log('📝 Config.js cargado para Electron:', window.ENV);
        `;
        res.setHeader("Content-Type", "application/javascript");
        res.end(configContent);
        return;
      }

      // Si es una carpeta, buscar index.html
      if (fs.existsSync(pathname) && fs.lstatSync(pathname).isDirectory()) {
        pathname = path.join(pathname, "index.html");
      }

      // Si no existe el archivo, servir index.html (SPA routing)
      if (!fs.existsSync(pathname)) {
        pathname = path.join(directory, "index.html");
      }

      fs.readFile(pathname, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end(`File not found: ${pathname}`);
          return;
        }

        const ext = path.parse(pathname).ext;
        const contentType = mimeTypes[ext] || "text/plain";

        res.setHeader("Content-Type", contentType);
        res.end(data);
      });
    });

    server.listen(port, "localhost", () => {
      console.log(`📡 Servidor estático iniciado en puerto ${port}`);
      resolve();
    });

    server.on("error", reject);
  });
}

// Función auxiliar para esperar a que un servidor esté listo
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkServer() {
      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for server"));
        return;
      }

      const http = require("http");
      const urlObj = new URL(url);

      const req = http.get(
        {
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: "/",
          timeout: 1000,
        },
        (res) => {
          resolve();
        }
      );

      req.on("error", () => {
        setTimeout(checkServer, 500);
      });

      req.on("timeout", () => {
        req.destroy();
        setTimeout(checkServer, 500);
      });
    }

    checkServer();
  });
}

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, '..', 'assets', 'BeastVault-icon.png'),
    show: false,
  });

  // Configurar variable de entorno para el frontend
  mainWindow.webContents.on("dom-ready", () => {
    console.log("🌐 Configurando API_BASE_URL para el frontend...");
    const apiUrl = `http://localhost:5000`;
    console.log("🌐 API URL:", apiUrl);

    mainWindow.webContents
      .executeJavaScript(
        `
      window.API_BASE_URL = '${apiUrl}';
      console.log('🌐 API_BASE_URL configurado en frontend:', window.API_BASE_URL);
    `
      )
      .catch((err) => {
        console.error("Error configurando API_BASE_URL:", err);
      });
  });

  mainWindow.loadURL(frontendUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Mostrar diálogo de configuración inicial
async function showSetupDialog() {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Configuración Inicial",
    message: "BeastVault - Configuración",
    detail: `Los archivos de Pokemon se guardarán en:\n${beastVaultPath}\n\nLa base de datos se guardará en:\n${dbPath}\n\n¿Deseas continuar?`,
    buttons: ["Continuar", "Abrir Carpeta de BeastVault", "Cancelar"],
    defaultId: 0,
  });

  if (result.response === 1) {
    shell.openPath(beastVaultPath);
    return showSetupDialog();
  } else if (result.response === 2) {
    app.quit();
    return false;
  }

  return true;
}

// Eventos de la aplicación
app.whenReady().then(async () => {
  try {
    ensureDirectories();

    await startBackend();
    await setupFrontend();
    createWindow();

    // Mostrar diálogo de configuración en el primer uso
    const configFile = path.join(userDataPath, "first-run.txt");
    if (!fs.existsSync(configFile)) {
      setTimeout(async () => {
        const shouldContinue = await showSetupDialog();
        if (shouldContinue) {
          fs.writeFileSync(configFile, "configured");
        }
      }, 2000); // Esperar a que la ventana esté lista
    }
  } catch (error) {
    console.error("Error starting application:", error);
    dialog.showErrorBox(
      "Error",
      `No se pudo iniciar la aplicación: ${error.message}`
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  dialog.showErrorBox("Error Fatal", `Error no controlado: ${error.message}`);
});
