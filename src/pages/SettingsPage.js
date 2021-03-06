'use strict';
import React from "react";

var SettingsPage = React.createClass({
    onChangeSettings: function(gitlabUrl, gitlabToken, updateTimeout) {
        this.props.onStateChanged({
            settings: {
                gitlabUrl: gitlabUrl,
                gitlabToken: gitlabToken,
                updateTimeout: updateTimeout
            }
        });
    },
    onChangeWatch: function(projectId, isWatching) {
        var projects = this.props.projects;
        projects.find(p => p.id === projectId).isWatching = isWatching;
        this.props.onStateChanged({
            projects: projects
        });
    },
    onBadgeClick: function(arg) {
        // Do Nothing
    },
    render: function() {
       return (
           <div>
                <div className="panel panel-default">
                    <div className="panel-heading">Server Settings</div>
                    <div className="panel-body">
                        <SettingsServer gitlabUrl={this.props.settings.gitlabUrl} 
                            gitlabToken={this.props.settings.gitlabToken} 
                            updateTimeout={this.props.settings.updateTimeout} onChange={this.onChangeSettings} />
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Watching Projects</div>
                    <div className="panel-body">
                        <SettingsProjects projects={this.props.projects} onChangeWatch={this.onChangeWatch} />
                    </div>
                </div>
            </div>
       );
   } 
});
SettingsPage.menuItem = {
    key: "Settings",
    text: "Settings",
    faIcon: "cogs"
};

var SettingsPageTitle = React.createClass({
   render: function() {
       return (
           <span>{SettingsPage.menuItem.text}</span>
       );
   } 
});

var SettingsServer = React.createClass({
    onSubmit: function(e) {
        e.preventDefault();
        if(this.refs.gitlabUrlInput.value == this.props.gitlabUrl && this.refs.gitlabTokenInput.value == this.props.gitlabToken && this.refs.syncTimeoutInput.value == this.props.updateTimeout)
            return;
        this.props.onChange(this.refs.gitlabUrlInput.value, this.refs.gitlabTokenInput.value, this.refs.syncTimeoutInput.value);
    },
    render: function() {
        return(
            <form className="form-horizontal" role="form" onSubmit={this.onSubmit}>
                <div className="form-group">
                    <label className="control-label col-sm-2" htmlFor="gitlaburl">GitLab URL:</label>
                    <div className="col-sm-10">
                        <input type="url" className="form-control" id="gitlaburl" ref="gitlabUrlInput" placeholder="http://" defaultValue={this.props.gitlabUrl} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label col-sm-2" htmlFor="gittoken">Profile token:</label>
                    <div className="col-sm-10"> 
                        <input type="text" className="form-control" id="gittoken" ref="gitlabTokenInput" placeholder="Copy from Profile Settings -> Account" defaultValue={this.props.gitlabToken} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label col-sm-2" htmlFor="syncTimeout">Sync Timeout(sec):</label>
                    <div className="col-sm-10"> 
                        <input type="number" className="form-control" id="syncTimeout" ref="syncTimeoutInput" placeholder="Timeout of server requests" defaultValue={this.props.updateTimeout} min="5" />
                    </div>
                </div>
                <div className="form-group"> 
                    <div className="col-sm-offset-2 col-sm-10">
                        <button type="submit" className="btn btn-default">Save Settings</button>
                    </div>
                </div>
            </form>
        );
    } 
});
var SettingsProjects = React.createClass({
    onWatchChange: function(id, evt) {
        this.props.onChangeWatch(id, evt.target.checked);
    },
    render: function() {
        if(this.props.projects.length === 0)
            return (
                <span>
                    <span className="fa-stack fa-lg">
                    <i className="fa fa-warning fa-stack-1x"></i>
                    </span>
                    There are no projects. Check your server settings.
                </span>
            );
        var projectItems = this.props.projects.map((proj) => {
            return (
                <div className="checkbox" key={proj.id}>
                    <label>
                    <input type="checkbox" checked={proj.isWatching} onChange={this.onWatchChange.bind(this, proj.id)} />
                    {proj.namespace.name + " / " + proj.name}</label>
                </div>
            );
        });
        return (
            <form className="form-horizontal" role="form" onSubmit={this.onSubmit}>
                {projectItems}
            </form>
        );
    }
});

export { SettingsPage, SettingsPageTitle };