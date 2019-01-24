const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const fetch = require("electron-fetch").default;
const Analytics = require("electron-google-analytics").default;

const analytics = new Analytics("UA-37217525-11");

let mainWindow;

const menuTemplate = [
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "delete" },
      { role: "selectall" }
    ]
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  },
  {
    role: "window",
    submenu: [{ role: "minimize" }, { role: "close" }]
  },
  {
    role: "help",
    submenu: [
      {
        label: "Report Issue",
        click() {
          require("electron").shell.openExternal(
            "https://github.com/erwstout/android-messages/issues"
          );
        }
      },
      {
        label: "View Releases",
        click() {
          require("electron").shell.openExternal(
            "https://github.com/erwstout/android-messages/releases"
          );
        }
      },
      {
        label: "View On GitHub",
        click() {
          require("electron").shell.openExternal(
            "https://github.com/erwstout/android-messages"
          );
        }
      },
      {
        label: "View Changelog",
        click() {
          require("electron").shell.openExternal(
            "https://github.com/erwstout/android-messages/blob/master/CHANGELOG.md"
          );
        }
      }
    ]
  }
];

if (process.platform === "darwin") {
  menuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" }
    ]
  });

  // Edit menu
  menuTemplate[1].submenu.push(
    { type: "separator" },
    {
      label: "Speech",
      submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
    }
  );

  // Window menu
  menuTemplate[3].submenu = [
    { role: "close" },
    { role: "minimize" },
    { role: "zoom" },
    { type: "separator" },
    { role: "front" }
  ];
}

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

const checkForUpdates = async () => {
  const currentVersion = `v${app.getVersion()}`;
  const latestVersion = await fetch(
    "https://api.github.com/repos/erwstout/android-messages/releases/latest"
  )
    .then(res => res.json())
    .then(release => release.tag_name)
    .catch(err => console.error(err));

  if (currentVersion !== latestVersion) {
    console.log(
      dialog.showMessageBox(
        {
          type: "none",
          buttons: ["Cancel", "View Releases"],
          title: "Update Available",
          message: "There is an update available for Android Messages"
        },
        response => {
          if (response === 0) {
            return;
          }
          return require("electron").shell.openExternal(
            "https://github.com/erwstout/android-messages/releases"
          );
        }
      )
    );
  }
};

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

  // open links in default OS browser
  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  setTimeout(() => {
    checkForUpdates();
  }, 10000);

  analytics
    .event("Application", "launched", { evLabel: "Launched", evValue: 1 })
    .then(response => {
      console.log(response);
      return response;
    })
    .catch(err => {
      return err;
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
