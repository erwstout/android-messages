const { app, BrowserWindow } = require("electron");
const path = require("path");
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Android Messages",
    darkTheme: true,
    icon: path.join(__dirname, "assets/icons/png/AndroidMessages.png")
  });
  mainWindow.loadURL("https://messages.android.com");
  mainWindow.setTitle("Android Messages");

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
