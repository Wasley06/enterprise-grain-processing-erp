const { app, BrowserWindow, dialog } = require("electron");
const { fork } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

const APP_PORT = process.env.GRAIN_ERP_PORT || "3210";
let serverProcess;

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

async function createWindow() {
  startServer();
  await waitForServer(APP_PORT);

  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    title: "Grain ERP",
    backgroundColor: "#061a2d",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  await win.loadURL(`http://127.0.0.1:${APP_PORT}`);
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
