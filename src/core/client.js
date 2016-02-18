'use strict';

const Gitlab = require('gitlab');
const async = require('async');
const utils = require('./utils');
const moment = require('moment');

class GitLabWrapper {
    constructor(config, notifier) {
        this.config = config;
        this.client = null;
        this.projects = {};
        this.users = {};
        this.currentUserId = -1;
        this.notifier = notifier;
    } 
    
    init(callback) {
        var config = this.config;
        var state = createState(config);
        if(!config.hasServerInfo()) {
            state.error = "Gitlab URL and Token are mandatory.";
            callback(state);
            return;
        }
        this.client = createClient(config);
        async.parallel([
            this.loadCurrentUser.bind(this), 
            this.loadProjectsList.bind(this)], (err) => {
            if(err) {
                state.error = err;
                callback(state);
            }
            else
                this.sync(callback, state);
        });
    }
    
    onUpdateConfig(callback) {
        this.init(callback);
    }
    
    sync(callback, state) {
        state = state || createState(this.config);
        async.parallel([
            this.loadMergeRequests.bind(this, true)
        ], (error, results) => {
            if(error)
                state.error = error;
            updateState(state, this.projects, this.users, this.currentUserId);
            callback(state);
        });
    }
    
    onUpdateProjects(callback) {
        var watchProjects = this.config.getWatchProjects();
        for(let projectId in this.projects) {
            let project = this.projects[projectId];
            project.isWatching = watchProjects.indexOf(parseInt(projectId)) >= 0;
            project.mergeRequests = [];
        }
        this.sync(callback);
    }
    onTimeoutSync(callback) {
        let operations = [];
        let state = createState(this.config);
        operations.push(this.loadMergeRequests.bind(this, false));
        async.parallel(operations, (err) => {
            if(err)
                state.error = err;
            updateState(state, this.projects, this.users, this.currentUserId);
            callback(state);
        });
    }
    
    getUserId(id, userInfo) {
        if(!this.users[id]) {
            this.users[id] = {
                id: id,
                username: userInfo["username"],
                email: userInfo["email"],
                name: userInfo["name"]
            };
        }
        return id;
    }
    
    /* async operations */
    
    loadMergeRequests(skipChanges, callback) {
        var watchProjects = this.config.getWatchProjects().filter(pid => !!this.projects[pid]);
        let _this = this;
        async.map(watchProjects, (projectId, cb) => {
            _this.client.projects.merge_requests.list(projectId, (mergeRequests) => {
                let project = this.projects[projectId];
                if(!mergeRequests) {
                    cb(`Cannot load merge requests for '${utils.getProjectFullName(project)}'`);
                    return;
                }
                let oldMergeRequests = {};
                let changes = [];
                for(let i = 0, mr; mr = project.mergeRequests[i]; i++)
                    oldMergeRequests[mr.id] = mr;
                project.mergeRequests = [];
                
                for(let i = 0, mergeRequest; mergeRequest = mergeRequests[i]; i++) {
                    let author = mergeRequest["author"];
                    let assignee = mergeRequest["assignee"];
                    let guid = project.id + "_" + mergeRequest["id"];
                    let mr = {
                        id: mergeRequest["id"],
                        iid: mergeRequest["iid"],
                        guid: guid,
                        createdAt: mergeRequest["created_at"],
                        updatedAt: mergeRequest["updated_at"],
                        description: mergeRequest["description"],
                        targetBranch: mergeRequest["target_branch"],
                        sourceBranch: mergeRequest["source_branch"],
                        targetProjectId: mergeRequest["target_project_id"],
                        sourceProjectId: mergeRequest["source_project_id"],
                        title: mergeRequest["title"],
                        state: mergeRequest["state"],
                        author: _this.getUserId(author["id"], author),
                        assignee: assignee ? _this.getUserId(assignee["id"], assignee) : -1
                    };
                    project.mergeRequests.push(mr);
                    if(!skipChanges)
                        changes.push({source: oldMergeRequests[mr.id], target: mr});
                }
                cb(null, changes);
            });
        }, (err, results) => {
            let changes = [];
            for(let i = 0, pResults; pResults = results[i]; i++)
                changes = changes.concat(pResults);
            if(changes.length)
                this.notifier.onMergeRequestChanges(changes, this.currentUserId, this.users, this.projects);
            callback(err);
        });
    }
    
    loadCurrentUser(callback) {
        this.currentUserId = -1;
        let _this = this;
        this.client.users.current(function(result) {
            if (result) {
                _this.currentUserId = result["id"];
                _this.getUserId(result["id"], result);
                callback();
            }
            else
                callback();
        });
    }
    
    loadProjectsList(callback) {
        this.projects = {};
        var watchProjects = this.config.getWatchProjects();
        let _this = this;
        this.client.projects.all((result) => {
            if(typeof result === 'string' || result instanceof String) {
                callback(result);
            }
            else {
                for(let i = 0, project; project = result[i]; i++) {
                    let projectId = project["id"]; 
                    _this.projects[projectId] = {
                        id: projectId,
                        description: project["description"],
                        public: project["public"],
                        webUrl: project["web_url"],
                        name: project["name"],
                        namespace: {
                            id: project["namespace"]["id"],
                            name: project["namespace"]["name"],
                        },
                        star_count: project["star_count"],
                        mergeRequests: [],
                        isWatching: watchProjects.indexOf(projectId) > -1,
                        isAccessible: true
                    };
                }
                callback();
            }
            //}
        });
    }
}

function updateState(state, projects, users, currentUserId) {
    state.projects = [];
    state.users = users;
    state.userId = currentUserId;
    for(let projectId in projects)
        state.projects.push(projects[projectId]);
}

function createClient(config) {
    var serverInfo = config.getServerInfo();
    return new Gitlab({
        url: serverInfo.url,
        token: serverInfo.token
    });
}

function createState(config) {
    var serverInfo = config.getServerInfo();
    var updateTimeout = config.getUpdateTimeout();
    return {
        gitlabUrl: serverInfo.url,
        gitlabToken: serverInfo.token,
        updateTimeout: updateTimeout,
        projects: [],
        users: {},
        error: "",
        userId: -1
    };
}

module.exports = GitLabWrapper;