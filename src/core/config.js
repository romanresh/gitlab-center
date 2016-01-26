'use strict';

const fs = require('fs');

class AppConfig {
    constructor() {
        this.nconf = require('nconf');
        try {
            this.nconf.file({file: "config.json"});
        }
        catch(exc) {
            
        }
        this.nconf.defaults({"updateTimeout": 30});
    }
    
    getServerInfo() {
        return {
            url: this.nconf.get("server:url"),
            token: this.nconf.get("server:token")
        };
    }
    
    hasServerInfo() {
        return !!(this.nconf.get("server:url") && this.nconf.get("server:token"));
    }
    
    getWatchProjects() {
        return this.nconf.get("projects") || [];
    }
    
    getUpdateTimeout() {
        return this.nconf.get("updateTimeout") || 30;
    }
    onUpdateSettings(info) {
        this.nconf.set("server:url", info.gitlabUrl);
        this.nconf.set("server:token", info.gitlabToken);
        this.nconf.set("updateTimeout", info.updateTimeout);
        this.nconf.set("projects", []);
        this.saveSettings();
    }
    onUpdateProjects(projects) {
        let result = [];
        for(let i = 0, project; project = projects[i]; i++) {
            if(project.isWatching)
                result.push(project.id);
        }
        this.nconf.set("projects", result);
        this.saveSettings();
    }
    saveSettings() {
        this.nconf.save(function (err) {
            fs.readFile('config.json');
        });
    }
}

module.exports = AppConfig;