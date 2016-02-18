'use strict';
const notifier = require('node-notifier');
const path = require('path');
const moment = require('moment');

class Notifier {
    constructor() {
        
    }
    onMergeRequestChanges(changes, userId, users, projects) {
        for(let i = 0, change; change = changes[i]; i++) {
            let source = change.source;
            let target = change.target;
            if(target["author"] == userId || target["assignee"] == userId || (source && source["assignee"] == userId)) {
                if(!source)
                    this.notifyMergeRequest("Merge request CREATED", target, users, projects);
                else if(target["state"] != source["state"])
                    this.notifyMergeRequest(`Merge request ${target["state"].toUpperCase()}`, target, users, projects);
                else if(source["assignee"] != target["assignee"])
                    this.notifyMergeRequest(`Merge request ASSIGNED to ${users[target["assignee"]].name}`, target, users, projects);
            }
        }
    }
    notifyMergeRequest(title, mergeRequest, users, projects) {
        let message = mergeRequest.title;
        message += "\r\n";
        if(mergeRequest.description)
            message += mergeRequest.description + "\r\n";
        
        let targetProject = projects[mergeRequest.targetProjectId];
        let sourceProject = projects[mergeRequest.sourceProjectId];
        let author = users[mergeRequest.author];
        
        if(mergeRequest.targetProjectId == mergeRequest.sourceProjectId)
            message += `${targetProject.namespace.name} / ${targetProject.name} [${mergeRequest.sourceBranch}] -> ${mergeRequest.targetBranch}`;
        else if(!sourceProject)
            message += `${author.name} [${mergeRequest.sourceBranch}] -> ${targetProject.namespace.name} / ${targetProject.name} [${mergeRequest.targetBranch}]`;
        else if(sourceProject)
            message += `${sourceProject.namespace.name} / ${sourceProject.name} [${mergeRequest.sourceBranch}] -> ${targetProject.namespace.name} / ${targetProject.name} [${mergeRequest.targetBranch}]`;

        this.notify(title, message);
    }
    notify(title, message) {
        let iconPath;
        if(typeof process !== 'undefined' && process.env.NODE_ENV === 'development')
            iconPath = path.resolve(__dirname + '\\..\\..') + '/public/logo-square.png'; 
        else
            iconPath = path.resolve(__dirname + '\\..\\..\\..') + "\\app.asar.unpacked\\public\\logo-square.png";
        
        notifier.notify({
            title: title,
            message: message,
            icon: iconPath,
            sound: true,
            wait: false
            }, function (err, response) {
            // Response is response from notification
        });
    }
}

module.exports = Notifier;