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
            else {
                async.parallel([
                    this.loadMergeRequests.bind(this)
                ], () => {
                    updateState(state, this.projects, this.currentUserId);
                    callback(state);
                });
            }
        });
    }
    
    getUserInfo(id, userInfo) {
        if(!this.users[id]) {
            this.users[id] = {
                username: userInfo["username"],
                email: userInfo["email"],
                name: userInfo["name"],
                isCurrent: this.currentUserId == id
            };
        }
        return this.users[id];
    }
    
    /* async operations */
    
    loadMergeRequests(callback) {
        var watchProjects = this.config.getWatchProjects().filter(pid => !!this.projects[pid]);
        let _this = this;
        async.map(watchProjects, (projectId, cb) => {
            var project = this.projects[projectId];
            project.mergeRequests = [];
            _this.client.projects.mergeRequests.list(projectId, function(mergeRequests) {
                for(let i = 0, mergeRequest; mergeRequest = mergeRequests[i]; i++) {
                    let author = mergeRequests["author"];
                    let assignee = mergeRequests["assignee"];
                    project.mergeRequests.push({
                        id: mergeRequest["id"],
                        targetBranch: mergeRequest["target_branch"],
                        sourceBranch: mergeRequest["source_branch"],
                        projectId: mergeRequest["project_id"],
                        title: mergeRequest["title"],
                        state: mergeRequest["state"],
                        author: _this.getUserInfo(author["id"], author),
                        assignee: _this.getUserInfo(assignee["id"], assignee)
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
        this.client.users.current(function(err, resp, result) {
            if(err)
                callback(err);
            else if (result) {
                _this.currentUserId = result["id"];
                _this.getUserInfo(result["id"], result);
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
        this.client.projects.all((err, resp, result) => {
            if(err) {
                callback(err);
                return;
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
                        namespace: project["namespace"],
                        star_count: project["star_count"],
                        mergeRequests: [],
                        isWatching: watchProjects.indexOf(projectId) > -1
                    };
                }
                callback();
            }
        });
    }
}

function updateState(state, projects, currentUserId) {
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
        projects: {},
        watchProjects: [],
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