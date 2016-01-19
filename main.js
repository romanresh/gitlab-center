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
});


function createClient() {
    return gitlab.createPromise({
        api: nconf.get("server:url") + "/api/v3",
        privateToken: nconf.get("server:token")
    });
}

ipcMain.on("need-project-list", function() {
   var client = createClient();
    client.projects.list()
        .then(function(projects) {
            var result = [];
            for(let i = 0; i < projects.length; i++) {
                result.push({ 
                    name: projects[i].name, 
                    id: projects[i].id
                });
            }
            mainWindow.webContents.send('need-project-list-reply', projects);
        })
        .catch(function(err) {
            mainWindow.webContents.send('need-project-list-reply', [{name: "qqq", id: 123}]);
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
});