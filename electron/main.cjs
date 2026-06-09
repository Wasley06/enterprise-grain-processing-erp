const { app, BrowserWindow, Menu, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const { fork } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

const APP_PORT = process.env.GRAIN_ERP_PORT || "3210";
let serverProcess;
let mainWindow;

function log(message) {
  const userDataPath = app.getPath("userData");
  fs.mkdirSync(userDataPath, { recursive: true });
  const logPath = path.join(userDataPath, "grain-erp-launch.log");
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
}

function waitForServer(port, timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ port: Number(port), host: "127.0.0.1" });
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error("The Grain ERP local service did not start in time."));
          return;
        }
        setTimeout(tryConnect, 350);
      });
    };
    tryConnect();
  });
}

function startServer() {
  const appPath = app.getAppPath();
  const serverPath = path.join(appPath, "dist", "server.cjs");
  const appCwd = appPath;
  log(`Starting server ${serverPath} on port ${APP_PORT}`);
  if (!fs.existsSync(serverPath)) {
    throw new Error(`Packaged server file was not found: ${serverPath}`);
  }
  serverProcess = fork(serverPath, [], {
    cwd: appCwd,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: APP_PORT
    },
    stdio: "pipe"
  });

  serverProcess.on("error", (error) => {
    log(`Server error: ${error.message}`);
    dialog.showErrorBox("Grain ERP service failed", error.message);
  });

  serverProcess.stdout?.on("data", (chunk) => log(`server stdout: ${chunk.toString().trim()}`));
  serverProcess.stderr?.on("data", (chunk) => log(`server stderr: ${chunk.toString().trim()}`));
  serverProcess.on("exit", (code, signal) => log(`Server exited code=${code} signal=${signal}`));
}

function configureAutoUpdater() {
  if (!app.isPackaged) {
    log("Updater skipped in development mode.");
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => log("Checking for desktop update."));
  autoUpdater.on("update-available", (info) => log(`Desktop update available: ${info.version}`));
  autoUpdater.on("update-not-available", (info) => log(`Desktop update not available: ${info.version}`));
  autoUpdater.on("download-progress", (progress) => log(`Desktop update download ${Math.round(progress.percent)}%.`));
  autoUpdater.on("error", (error) => log(`Desktop update error: ${error.message}`));
  autoUpdater.on("update-downloaded", async (info) => {
    log(`Desktop update downloaded: ${info.version}`);
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Restart and update", "Update next time"],
      defaultId: 0,
      cancelId: 1,
      title: "Grain ERP update ready",
      message: `Grain ERP ${info.version} is ready.`,
      detail: "Restart now to apply the update, or it will install automatically the next time you close and open Grain ERP."
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => log(`Desktop update check failed: ${error.message}`));
  }, 3000);
}

async function createWindow() {
  Menu.setApplicationMenu(null);
  startServer();
  await waitForServer(APP_PORT);

  const iconPath = path.join(app.getAppPath(), "electron", "assets", "grain-erp-icon.ico");
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    title: "Grain ERP",
    backgroundColor: "#061a2d",
    icon: iconPath,
    frame: true,
    autoHideMenuBar: true,
    roundedCorners: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  await mainWindow.loadURL(`http://127.0.0.1:${APP_PORT}`);
  configureAutoUpdater();
}

app.whenReady().then(createWindow).catch((error) => {
  dialog.showErrorBox("Grain ERP failed to start", error.message);
  app.quit();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});
