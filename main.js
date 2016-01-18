'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = electron.ipcMain;
const nconf = require('nconf');
const gitlab = require('node-gitlab');

nconf.file({file: "config.json"});

var shouldQuit = app.makeSingleInstance(function() {
    if(mainWindow) {
        if(mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.focus();
    }
    return true;
});

if (shouldQuit) {
    app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform != 'darwin') {
        app.quit();
    //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/public/index.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function() {
        updateStatus(mainWindow);

    });
});

function updateStatus(window) {
        var client = gitlab.createPromise({
            api: nconf.get("server:url") + "/api/v3",
            privateToken: nconf.get("server:token")
        });
        client.projects.list()
            .then(function(projects) {
                mainWindow.webContents.send('ping', projects);
            })
            .catch(function(err) {
                switch (err.name) {
                    case "Gitlab401Error":
                        // wrong token
                        break;
                    case "GitlabRequestError":
                        switch (err.code) {
                            case "ENOTFOUND":
                                // server not found
                                break;
                            case "":
                                break;
                        }
                        break;
                    case "GitlabJSONResponseFormatError":
                        // redirected
                        break;
                }
                mainWindow.webContents.send('ping', err);
            });
}