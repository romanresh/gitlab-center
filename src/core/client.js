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
            this.loadMergeRequests.bind(this)
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
    
    getUserId(id, userInfo) {
        if(!this.users[id]) {
            this.users[id] = {
                id: id,
                username: userInfo["username"],
                email: userInfo["email"],
                name: userInfo["name"],
                isCurrent: this.currentUserId == id
            };
        }
        return id;
    }
    
    /* async operations */
    
    loadMergeRequests(callback) {
        var watchProjects = this.config.getWatchProjects().filter(pid => !!this.projects[pid]);
        let _this = this;
        async.map(watchProjects, (projectId, cb) => {
            var project = this.projects[projectId];
            project.mergeRequests = [];
            _this.client.projects.merge_requests.list(projectId, function(mergeRequests) {
                for(let i = 0, mergeRequest; mergeRequest = mergeRequests[i]; i++) {
                    let author = mergeRequest["author"];
                    let assignee = mergeRequest["assignee"];
                    project.mergeRequests.push({
                        id: mergeRequest["id"],
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
                    });
                }
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
    var myMergeRequests = 0;
    var assignedToMeMergeRequests = 0;
    for(let projectId in projects) {
        let project = projects[projectId];
        if(!project.isWatching)
            continue;
        for(let i = 0, mergeRequest; mergeRequest = project.mergeRequests[i]; i++) {
            if(mergeRequest.author.id == currentUserId)
                myMergeRequests++;
            if(mergeRequest.assignee.id == currentUserId)
                assignedToMeMergeRequests++;
        }
    }
    state.tags.mergeRequests.mine = myMergeRequests;
    state.tags.mergeRequests.assignedToMe = assignedToMeMergeRequests;
    state.projects = [];
    state.users = users;
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
    return {
        gitlabUrl: serverInfo.url,
        gitlabToken: serverInfo.token,
        projects: [],
        users: {},
        error: "",
        tags: {
            mergeRequests: {
                mine: 0,
                assignedToMe: 0
            }
        }
    };
}

module.exports = GitLabWrapper;