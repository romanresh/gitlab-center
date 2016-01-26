'use strict';

const Gitlab = require('gitlab');
const async = require('async');

class GitLabWrapper {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.projects = {};
        this.users = {};
        this.currentUserId = -1;
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
        ], () => {
            updateState(state, this.projects, this.users, this.currentUserId);
            callback(state);
        });
    }
    
    onUpdateProjects(callback) {
        var watchProjects = this.config.getWatchProjects().filter(pid => !!this.projects[pid]);
        for(let projectId in this.projects) {
            let project = this.projects[projectId];
            project.isWatching = watchProjects.indexOf(projectId) >= 0;
        }
        this.sync(callback);
    }
    onSync(callback, reloadAll) {
        let operations = [];
        let state = createState(this.config);
        if(reloadAll)
            operations.push(this.loadProjectsList.bind(this));
        operations.push(this.loadMergeRequests.bind(this, reloadAll));
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
    
    loadMergeRequests(reloadAll, callback) {
        var watchProjects = this.config.getWatchProjects().filter(pid => !!this.projects[pid]);
        let _this = this;
        async.map(watchProjects, (projectId, cb) => {
            var project = this.projects[projectId];
            if(reloadAll)
                project.mergeRequests = [];
            var lastMergeRequest = project.mergeRequests[0];
            let newMergeRequests = [];
            _this.client.projects.merge_requests.list(projectId, function(mergeRequests) {
                for(let i = 0, mergeRequest; mergeRequest = mergeRequests[i]; i++) {
                    let author = mergeRequest["author"];
                    let assignee = mergeRequest["assignee"];
                    if(!reloadAll && lastMergeRequest && (new Date(mergeRequest["created_at"]) < new Date(lastMergeRequest.createdAt) || lastMergeRequest.id == mergeRequest["id"]))
                        break;
                    newMergeRequests.push({
                        id: mergeRequest["id"],
                        guid: project.id + "_" + mergeRequest["id"],
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
                        assignee: assignee ? _this.getUserId(assignee["id"], assignee) : -1,
                        isNew: !reloadAll
                    });
                }
                if(!reloadAll)
                    project.mergeRequests = newMergeRequests.concat(project.mergeRequests);
                else
                    project.mergeRequests = newMergeRequests;
                cb();
            });
        }, (err, results) => {
            callback();
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
                        web_url: project["web_url"],
                        name: project["name"],
                        namespace: {
                            id: project["namespace"]["id"],
                            name: project["namespace"]["name"],
                        },
                        star_count: project["star_count"],
                        mergeRequests: [],
                        isWatching: watchProjects.indexOf(projectId) > -1
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