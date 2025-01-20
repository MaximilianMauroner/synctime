import { app, BrowserWindow, Menu, Tray } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import { activeWindowChecker } from "./helpers/windows";
import path from "path";

const inDevelopment = process.env.NODE_ENV === "development";

activeWindowChecker()

if (require("electron-squirrel-startup")) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;
function createWindow() {
    if (mainWindow) {
        mainWindow.show();
        return;
    }
    const preload = path.join(__dirname, "preload.js");
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            devTools: inDevelopment,
            contextIsolation: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: false,

            preload: preload,
        },
        show: true,
        titleBarStyle: "hidden",
    });
    registerListeners(mainWindow);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
        );
    }

    mainWindow.on("close", (event) => {
        event.preventDefault(); // Prevent the app from closing
        if (!mainWindow) return;
        mainWindow.hide(); // Hide the window instead of closing it
    });
}
// app.whenReady().then(createWindow);
app.whenReady().then(() => {
    const tray = new Tray('./src/assets/tray-icon.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Window', type: 'normal', click: () => {
                if (!mainWindow || mainWindow.isDestroyed()) {
                    createWindow();
                } else {
                    mainWindow.show();
                }
            },
        },
        { label: 'Close', type: 'normal', click: () => app.quit() },
    ])
    tray.setToolTip('Sync-Time')
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
        if (mainWindow && !mainWindow.isVisible()) {
            mainWindow.show();
        }
    });
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (!mainWindow) {
        createWindow();
    } else {
        mainWindow.show();
    }
});
