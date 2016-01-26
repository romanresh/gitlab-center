'use strict';
import React from "react";
const moment = electronRequire('moment');
import Select from 'react-select';

var MergeRequestsPage = React.createClass({
    getInitialState: function() {
        return {
            status: "all", // opened, merged, closed, all
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
       let mergeRequestList = mergeRequests.map((mr) => {
           return <MergeRequestItem {...mr} projects={this.props.projects} users={this.props.users} key={mr.guid} />
       });
       
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
    render: function() {
        let targetProject = this.props.projects.find(p => p.id == this.props.targetProjectId);
        let sourceProject = this.props.projects.find(p => p.id == this.props.sourceProjectId);
        
        return (
            <div className="panel panel-default">
                <div className="panel-heading">{this.props.title}
                    <span className="label label-primary pull-right">{this.props.state}</span>
                </div>
                <div className="panel-body">
                    <div className="pull-left">
                        {this.props.description}
                        {this.props.description ? <br /> : null}
                        <span className="text-muted">Assigned on</span> <strong>{this.props.assignee >= 0 ? this.props.users[this.props.assignee].name : "None"}</strong><br />
                        <span className="text-muted">Created</span> <abbr title={this.props.createdAt}>{moment(this.props.createdAt).fromNow()}</abbr> <span className="text-muted">by</span> <strong>{this.props.users[this.props.author].name}</strong>
                    </div>
                    <div className="pull-right">
                    <strong><abbr title={sourceProject.namespace.name + " / " + sourceProject.name}>{sourceProject.name}</abbr> [{this.props.sourceBranch}]</strong> <i className="fa fa-arrow-right text-muted"></i> <strong><abbr title={targetProject.namespace.name + " / " + targetProject.name}>{targetProject.name}</abbr> [{this.props.targetBranch}]</strong></div>
                </div>
            </div>
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

var MergeRequestsPageTitle = React.createClass({
    onAssignedBadgeClick: function() {
        this.props.onBadgeClick("merge-request-assigned");
    },
    onOpenedBadgeClick: function() {
        this.props.onBadgeClick("merge-request-opened");
    },
   render: function() {
       var assignedToMe = 0;
       var openedByMe = 0;
       for(let i = 0, project; project = this.props.projects[i]; i++) {
        for(let j = 0, mergeRequest; mergeRequest = project.mergeRequests[j]; j++) {
            if(mergeRequest.assignee == this.props.userId && isOpened(mergeRequest))
                assignedToMe++;
            if(mergeRequest.author == this.props.userId && isOpened(mergeRequest))
                openedByMe++;
        }
       }
       
       var assignedToMeBadge = null;
       var openedByMeBadge = null;
       
       if(assignedToMe > 0)
            assignedToMeBadge = <span className="badge merge-request-badge-assigned" title="Assigned To Me" onClick={this.onAssignedBadgeClick}>{assignedToMe}</span>;
       if(openedByMe > 0)
            openedByMeBadge = <span className="badge merge-request-badge-opened" title="Opened By Me" onClick={this.onOpenedBadgeClick}>{openedByMe}</span>;
       return (
           <span>{MergeRequestsPage.menuItem.text} {assignedToMeBadge} {openedByMeBadge}</span>
       );
   } 
});

export { MergeRequestsPage, MergeRequestsPageTitle };

function getMergeRequests(projects, status, assignee, author, targetProject, searchString) {
    let results = [];
    for(let i = 0, project; project = projects[i]; i++) {
        for(let j = 0, mergeRequest; mergeRequest = project.mergeRequests[j]; j++) {
            if(status != "all") {
                if(status == "opened" && !isOpened(mergeRequest))
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
                if(mergeRequest.title.indexOf(searchString) < 0 &&
                    mergeRequest.description.indexOf(searchString) < 0)
                continue;
            }
            results.push(mergeRequest);
        }
    }
    return results;
}

function isOpened(mergeRequest) {
    return ["opened", "reopened"].indexOf(mergeRequest.state) > -1;
}