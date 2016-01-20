'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = electron.ipcMain;
const nconf = require('nconf');
const Gitlab = require('gitlab');

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

ipcMain.on("init-request", function() {
    var gitlabUrl = nconf.get("server:url");
    var gitlabToken = nconf.get("server:token");
    var projects = nconf.get("projects");
    var state = {
        gitlabUrl: gitlabUrl,
        gitlabToken: gitlabUrl,
        projects: projects,
        error: "",
        state: {}
    }
    
    if(!gitlabUrl || !gitlabToken)
        mainWindow.webContents.send('init-request-reply', state);
    else {
        var gitlab = createClient();
        var projects = gitlab.projects.all(function(err, resp, result){
            if(err) {
                state.error = err;
                mainWindow.webContents.send('init-request-reply', state);
            }
            else {
                var requiredProjects = [];
                for(let i = 0, project; project = result[i]; i++) {
                    var projectID = project["id"];
                    if(projects.indexOf(project["id"]))
                        requiredProjects.push(projectID);
                }
                fillAndSendState('init-request-reply', gitlab, state);
            }
        });
    }
});

function fillAndSendState(eventName, gitLab, state) {
    // TODO: start with
}

function createClient() {
    return new Gitlab({
        url: nconf.get("server:url"),
        gitlabToken: nconf.get("server:token")
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