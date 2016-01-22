'use strict';

const fs = require('fs');

class AppConfig {
    constructor() {
        this.nconf = require('nconf');
        this.nconf.file({file: "config.json"});
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
    
    update(info) {
        this.nconf.set("server:url", info.gitlabUrl);
        this.nconf.set("server:token", info.gitlabToken);
        this.nconf.set("server:projects", info.projects);
        
        this.nconf.save(function (err) {
            fs.readFile('config.json');
        });
    }
}

module.exports = AppConfig;