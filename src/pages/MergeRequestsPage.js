'use strict';
import React from "react";
const moment = electronRequire('moment');
const shell = electronRequire('electron').shell;
const clipboard = electronRequire('electron').clipboard;

import * as utils from '../core/utils'; 
import Select from 'react-select';

var MergeRequestsPage = React.createClass({
    getInitialState: function() {
        return {
            status: "opened", // opened, merged, closed, all
            assignee: -1, // userId,
            author: -1, // userId,
            targetProject: -1 // userId 
        };
    },
    onBadgeClick: function(arg) {
        if(arg == "merge-request-assigned") {
            this.setState({
                status: "opened",
                assignee: this.props.userId,
                author: -1,
                targetProject: -1
            });
        }
        else if(arg == "merge-request-opened") {
            this.setState({
                status: "opened",
                assignee: -1,
                author: this.props.userId,
                targetProject: -1
            });
        }
    },
    onFilterStatusChanged: function(status) {
        this.setState({
            status: status
        });
    },
    onFilterAssigneeChanged: function(val) {
        this.setState({
            assignee: val ? val.value : -1
        });
    },
    onFilterProjectChanged: function(val) {
        this.setState({
            targetProject: val ? val.value : -1
        });
    },
    onFilterAuthorChanged: function(val) {
        this.setState({
            author: val ? val.value : -1
        });
    },
    
    render: function() {
       let mergeRequests = getMergeRequests(this.props.projects, this.state.status,
           this.state.assignee, this.state.author, this.state.targetProject, this.props.searchString);
       let mergeRequestList;
       if(mergeRequests.length) {
            mergeRequestList = mergeRequests.map((mr) => {
                return <MergeRequestItem {...mr} projects={this.props.projects} users={this.props.users} key={mr.guid} userId={this.props.userId} />
            });
       }
       else {
           mergeRequestList = (<div className="text-center text-muted panel panel-default">
            <div className="panel-body">There are no merge requests. Check applied filters or setup Watching Projects on the Settings page</div>
           </div>);
       }
       
       return (
           <div className="merge-requests">
           <div className="row">
            <div className="col-md-16 text-center">
                <MergeRequestsStatusFilter status={this.state.status} onStatusChanged={this.onFilterStatusChanged} />
                </div>
            </div>
            <div className="row">
                <div className="col-md-9">
                    <div className="list">
                        {mergeRequestList}
                    </div>
                </div>
                <div className="col-md-3">
                    <MergeRequestsFilter projects={this.props.projects} users={this.props.users}
                        selectedProject={this.state.targetProject}
                        selectedAssignee={this.state.assignee}
                        selectedAuthor={this.state.author}
                        onProjectChanged={this.onFilterProjectChanged} 
                        onAssigneeChanged={this.onFilterAssigneeChanged} 
                        onAuthorChanged={this.onFilterAuthorChanged} />
                </div>
            </div>
           </div>
       );
    } 
});

var MergeRequestItem = React.createClass({
    onExternalLinkClick: function() {
        let url = utils.getMergeRequestUrl(this.props.projects.find(p => p.id == this.props.targetProjectId), this.props.iid);
        shell.openExternal(url);
    },
    onClipboardLinkClick: function() {
        let url = utils.getMergeRequestUrl(this.props.projects.find(p => p.id == this.props.targetProjectId), this.props.iid);
        clipboard.writeText(url);
    },
    render: function() {
        let targetProject = this.props.projects.find(p => p.id == this.props.targetProjectId);
        let sourceProject = this.props.projects.find(p => p.id == this.props.sourceProjectId);
        let author = this.props.users[this.props.author];
        let mergeDirection = null;
        if(this.props.targetProjectId == this.props.sourceProjectId) {
            mergeDirection = (
                <span>
                    <strong>
                        {targetProject.namespace.name} / {targetProject.name} [{this.props.sourceBranch}] 
                    </strong> <i className="fa fa-arrow-right text-muted"></i> <strong>
                        [{this.props.targetBranch}] 
                    </strong>
                </span>
            );
        }
        else if(!sourceProject) {
            mergeDirection = (
                <span>
                    <strong>
                        <abbr title="Unknown project">{author.name}</abbr> [{this.props.sourceBranch}]
                    </strong> <i className="fa fa-arrow-right text-muted"></i> <strong>
                        <abbr title={targetProject.namespace.name + " / " + targetProject.name}>{targetProject.name}</abbr> [{this.props.targetBranch}]
                    </strong>
                </span>
            );
        }
        else if(sourceProject) {
            mergeDirection = (
                <span>
                    <strong>
                        <abbr title={sourceProject.namespace.name + " / " + sourceProject.name}>{sourceProject.namespace.name + " / " + sourceProject.name}</abbr> [{this.props.sourceBranch}]
                    </strong> <i className="fa fa-arrow-right text-muted"></i> <strong>
                        <abbr title={targetProject.namespace.name + " / " + targetProject.name}>{targetProject.name}</abbr> [{this.props.targetBranch}]
                    </strong>
                </span>
            );
        }
        
        return (
            <div className="panel panel-default">
                <div className="panel-heading">{this.props.title} 
                  <a href="javascript:void(0)" onClick={this.onExternalLinkClick} title="Open in browser"><i className="fa fa-external-link" style={{margin: "0 5px"}}></i></a>
                  <a href="javascript:void(0)" onClick={this.onClipboardLinkClick} title="Copy link to clipboard"><i className="fa fa-clipboard"></i></a>
                    <MergeRequestItemLabel state={this.props.state} />
                    <small className="text-muted pull-right" style={{marginRight: "5px"}}>{"#" + this.props.iid}</small>
                </div>
                <div className="panel-body">
                    {this.props.description}
                    <div>
                        <span className="text-muted">Assigned on</span> <strong className={this.props.assignee >= 0 && this.props.assignee != this.props.userId ? null : "text-danger"}>{this.props.assignee >= 0 ? this.props.users[this.props.assignee].name : "None"}</strong>
                        <div className="pull-right text-right">
                            <span className="text-muted">updated <abbr title={moment(this.props.updatedAt).format('lll')}>{moment(this.props.updatedAt).fromNow()}</abbr></span>
                        </div>
                    </div>
                    <div>
                        <span className="text-muted">Created</span> <abbr title={moment(this.props.createdAt).format('lll')}>{moment(this.props.createdAt).fromNow()}</abbr> <span className="text-muted">by</span> <strong className={this.props.author == this.props.userId ? "text-primary" : null}>{author.name}</strong>
                        <div className="pull-right text-right">{mergeDirection}</div>
                    </div>
                </div>
            </div>
        );
    }
});
var MergeRequestItemLabel = React.createClass({
    render: function() {
        let classPostfix = "warning";
        if(utils.isOpenedMergeRequest(this.props.state))
            classPostfix = "primary";
        else if(this.props.state == "merged")
            classPostfix = "success";
        else if(this.props.state == "closed")
            classPostfix = "default";
        return (
            <span className={"label label-" + classPostfix + " pull-right"}>{this.props.state}</span>
        );
    }
});
var MergeRequestsStatusFilter = React.createClass({
    render: function() {
        return (
            <div className="btn-group status-filter" data-toggle="buttons">
                <MergeRequestsStatusFilterItem activeStatus={this.props.status} status="opened" onStatusChanged={this.props.onStatusChanged} />
                <MergeRequestsStatusFilterItem activeStatus={this.props.status} status="merged" onStatusChanged={this.props.onStatusChanged} />
                <MergeRequestsStatusFilterItem activeStatus={this.props.status} status="closed" onStatusChanged={this.props.onStatusChanged} />
                <MergeRequestsStatusFilterItem activeStatus={this.props.status} status="all" onStatusChanged={this.props.onStatusChanged} /> 
            </div>
        );
    }
});
var MergeRequestsStatusFilterItem = React.createClass({
    onButtonClick: function() {
        this.props.onStatusChanged(this.props.status);
    },
    render: function() {
        return (
            <button type="button" className={"btn text-capitalize btn-default" + (this.props.activeStatus == this.props.status ? " active" : "")} onClick={this.onButtonClick}>{this.props.status}</button>
        );
    }
});

var MergeRequestsFilter = React.createClass({
    render: function() {
        let projects = this.props.projects.map(function(p) {
            return {
                value: p.id,
                label: p.namespace.name + " / " + p.name
            };
        });
        projects.sort((p1, p2) => p1.label.localeCompare(p2.label));
        
        let users = [];
        for(let userId in this.props.users) {
            let user = this.props.users[userId];
            users.push({
                value: user.id,
                label: user.name
            });
        }
        users.sort((u1, u2) => u1.label.localeCompare(u2.label));
        return (
            <form>
                <div className="form-group">
                    <label htmlFor="project">Project:</label>
                    <Select name="project" options={projects} value={this.props.selectedProject} onChange={this.props.onProjectChanged} />
                </div>
                <div className="form-group">
                    <label htmlFor="assigneeCmb">Assignee:</label>
                    <Select name="assigneeCmb" options={users} value={this.props.selectedAssignee} onChange={this.props.onAssigneeChanged} />
                </div>
                <div className="form-group">
                    <label htmlFor="author">Author:</label>
                    <Select name="author" options={users} value={this.props.selectedAuthor} onChange={this.props.onAuthorChanged} />
                </div>
            </form>
        );
    }
});


MergeRequestsPage.menuItem = {
    key: "MergeRequest",
    text: "Merge Requests",
    faIcon: "tasks"
};
MergeRequestsPage.supportSearch = true;

var MergeRequestsPageTitle = React.createClass({
    onAssignedBadgeClick: function() {
        this.props.onBadgeClick("merge-request-assigned");
    },
    onOpenedBadgeClick: function() {
        this.props.onBadgeClick("merge-request-opened");
    },
   render: function() {
       let info = utils.getImportantMergeRequestsInfo(this.props.projects, this.props.userId);
       var assignedToMeBadge = null;
       var openedByMeBadge = null;
       
       if(info.assignedToMe)
            assignedToMeBadge = <span className="badge merge-request-badge-assigned" title="Assigned To Me" onClick={this.onAssignedBadgeClick}>{info.assignedToMe}</span>;
       if(info.mine)
            openedByMeBadge = <span className="badge merge-request-badge-opened" title="Opened By Me" onClick={this.onOpenedBadgeClick}>{info.mine}</span>;
       return (
           <span>{MergeRequestsPage.menuItem.text} {assignedToMeBadge} {openedByMeBadge} <CreateMergeRequestButton projects={this.props.projects} onClick={this.onCreateMergeRequestButtonClick} /></span>
       );
   } 
});

var CreateMergeRequestButton = React.createClass({
    onNewMergeRequestClick: function(proj, evt) {
        let url = proj.webUrl + "/merge_requests/new";
        shell.openExternal(url);
    },
    render: function() {
        var projects = this.props.projects.filter(proj => proj.isWatching).map((proj) => {
            return (
                <li key={proj.id}><a href="javascript:void(0)" onClick={this.onNewMergeRequestClick.bind(this, proj)}>{proj.namespace.name + " / " + proj.name}</a></li>
            );
        });
        return (
            <span>
            <a data-toggle="dropdown" data-target="#" role="button" aria-haspopup="true" aria-expanded="false" id="dNewMergeRequest">
                <i className="fa fa-plus-circle"></i>
            </a>
                <ul className="dropdown-menu" aria-labelledby="dNewMergeRequest">
                    <li className="dropdown-header">Choose Source Project:</li>
                    {projects}
                </ul>
            </span>
        );
    }
});

export { MergeRequestsPage, MergeRequestsPageTitle };

function getMergeRequests(projects, status, assignee, author, targetProject, searchString) {
    let results = [];
    searchString = searchString.toLowerCase();
    for(let i = 0, project; project = projects[i]; i++) {
        for(let j = 0, mergeRequest; mergeRequest = project.mergeRequests[j]; j++) {
            if(status != "all") {
                if(status == "opened" && !utils.isOpenedMergeRequest(mergeRequest.state))
                    continue;
                else if(status != "opened" && mergeRequest.state != status)
                    continue;
            }
            if(assignee >=0 && mergeRequest.assignee != assignee)
                continue;
            if(author >= 0 && mergeRequest.author != author)
                continue;
            if(targetProject >= 0 && mergeRequest.targetProjectId != targetProject)
                continue;
            if(searchString) {
                if(mergeRequest.title.toLowerCase().indexOf(searchString) < 0 &&
                    mergeRequest.description.toLowerCase().indexOf(searchString) < 0)
                continue;
            }
            results.push(mergeRequest);
        }
    }
    return results;
}