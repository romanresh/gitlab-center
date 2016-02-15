'use strict';

function getImportantMergeRequestsInfo(projects, userId) {
    let result = {
        mine: 0,
        assignedToMe: 0
    };
    for(let i = 0, project; project = projects[i]; i++) {
        for(let j = 0, mr; mr = project.mergeRequests[j]; j++) {
            if(!isOpenedMergeRequest(mr.state))
                continue;
            if(mr.assignee == userId)
                result.assignedToMe++;
            if(mr.author == userId)
                result.mine++;
        }
    }
    return result;
}

function isOpenedMergeRequest(state) {
    return ["opened", "reopened"].indexOf(state) > -1;
}

function getProjectFullName(project) {
    return `${project.namespace.name} \ ${project.name}`;
}

function getMergeRequestUrl(project, iid) {
    return project.webUrl + "/merge_requests/" + iid;
}

module.exports.getImportantMergeRequestsInfo = getImportantMergeRequestsInfo;
module.exports.isOpenedMergeRequest = isOpenedMergeRequest;
module.exports.getProjectFullName = getProjectFullName;
module.exports.getMergeRequestUrl = getMergeRequestUrl;