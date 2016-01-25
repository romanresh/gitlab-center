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
    
    onUpdateCredentials(info) {
        this.nconf.set("server:url", info.gitlabUrl);
        this.nconf.set("server:token", info.gitlabToken);
        this.nconf.set("projects", []);
        
        this.nconf.save(function (err) {
            fs.readFile('config.json');
        });
    }
    onUpdateProjects(projects) {
        let result = [];
        for(let i = 0, project; project = projects[i]; i++) {
            if(project.isWatching)
                result.push(project.id);
        }
        this.nconf.set("projects", result);
        
        this.nconf.save(function (err) {
            fs.readFile('config.json');
        });
    }
}

module.exports = AppConfig;