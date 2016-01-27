'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = electron.ipcMain;
const Tray = electron.Tray;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const CombinedStream = require('combined-stream');

const AppConfig = require('./src/core/config');
const GitLabWrapper = require('./src/core/client');
const Synchronizer = require('./src/core/synchronizer');

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
var appIcon = null;

var config = new AppConfig();
var wrapper = new GitLabWrapper(config);
var synchronizer = new Synchronizer(config, wrapper);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform != 'darwin') {
        synchronizer.stop();
        app.quit();
    //}
});
app.on('before-quit', () => {
    if(mainWindow) {
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024, 
        height: 600, 
        icon: __dirname + '/public/logo-square.png',
        'min-width': 1024,
        'min-height': 600
    });
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/public/index.html');

    // Open the DevTools.
    if(typeof process !== 'undefined' && process.env.NODE_ENV === 'development')
        mainWindow.webContents.openDevTools();
    
    mainWindow.on('close', function(event) {
        mainWindow.hide();
        event.preventDefault();
    });
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    
    appIcon = new Tray(__dirname + '/public/logo-square.png');
    appIcon.setToolTip('GitLab Center');
    appIcon.on('click', () => {
        mainWindow.focus();
    });
    var contextMenu = new Menu();
    contextMenu.append(new MenuItem({ label: 'Close GitLab Center', click: function() { app.quit(); } }));
    appIcon.setContextMenu(contextMenu);
});
// 
// 
ipcMain.on("init-request", function() {
    wrapper.init((state) => {
        mainWindow.webContents.send('init-request-reply', state);
        runSynchronizer();
        updateTray(state);
    });
});
ipcMain.on("update-settings", function(evt, arg) {
    config.onUpdateSettings(arg);
    wrapper.onUpdateConfig((state) => {
        runSynchronizer();
        mainWindow.webContents.send('update-settings-reply', state);
        updateTray(state);
    });
});
ipcMain.on('update-projects', function(evt, arg) {
    config.onUpdateProjects(arg);
    wrapper.onUpdateProjects((state) => {
        mainWindow.webContents.send('update-projects-reply', state);
        updateTray(state);
    });
});
ipcMain.on('sync', function(evt, arg) {
    synchronizer.stop();
    wrapper.sync((state) => {
        mainWindow.webContents.send('sync-reply', state);
        updateTray(state);
        runSynchronizer();
    });
});

function runSynchronizer() {
    synchronizer.start(
        () => mainWindow.webContents.send('before-sync'),
        (state) => {
            mainWindow.webContents.send('sync-reply', state);
            updateTray(state);
        });
}
function isOpened(mergeRequest) {
    return ["opened", "reopened"].indexOf(mergeRequest.state) > -1;
}
function updateTray(state) {
    return;
    var isActive = false;
    if(state.userId && state.projects.length) {
        for(let i = 0, project; project = state.projects[i]; i++) {
            if(project.mergeRequests.find(mr => isOpened(mr) && (mr.assignee == state.userId || ms.author == state.userId))) {
                isActive = true;
                break;
            }
        }
    }
    if(isActive)
        appIcon.setImage(__dirname + '/public/logo-square-active.png');
    else
        appIcon.setImage(__dirname + '/public/logo-square.png');
}