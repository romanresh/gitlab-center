'use strict';

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
}

module.exports = AppConfig;