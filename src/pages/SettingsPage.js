'use strict';
import React from "react";

var SettingsPage = React.createClass({
    onChangeSettings: function(gitlabUrl, gitlabToken) {
        this.props.onStateChanged({
            settings: {
                gitlabUrl: gitlabUrl,
                gitlabToken: gitlabToken
            }
        });
    },
    onChangeProjects: function() {
        
    },
    render: function() {
        var settingsProjectItems = null;
        if(this.props.projects.length === 0) {
            settingsProjectItems = (
                <div>There is no projects</div> 
            );
        }
        else {
            settingsProjectItems = this.props.projects.map((proj) => {
                return (
                    <SettingsProjectItem key={proj.id} id={proj.id} name={proj.namespace.name + " / " + proj.name} />
                );
            });
        }
       return (
           <div>
                <div className="panel panel-default">
                    <div className="panel-heading">Server Settings</div>
                    <div className="panel-body">
                        <SettingsServer gitlabUrl={this.props.settings.gitlabUrl} gitlabToken={this.props.settings.gitlabToken} onChange={this.onChangeSettings} />
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Server Settings</div>
                    <div className="panel-body">
                        <SettingsProjects projects={this.props.projects} />
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
        if(this.refs.gitlabUrlInput.value == this.props.gitlabUrl && this.refs.gitlabTokenInput.value == this.props.gitlabToken)
            return;
        this.props.onChange(this.refs.gitlabUrlInput.value, this.refs.gitlabTokenInput.value);
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
                        <div className="col-sm-offset-2 col-sm-10">
                            <button type="submit" className="btn btn-default">Save Settings</button>
                        </div>
                    </div>
                </form>
        );
    } 
});
var SettingsProjects = React.createClass({
    onSubmit: function(e) {
        e.preventDefault();
        
    },
    render: function() {
        if(this.props.projects.length === 0)
            return (
                <span>
                    <span className="fa-stack fa-lg">
                    <i className="fa fa-warning fa-stack-1x"></i>
                    </span>
                    There is no projects. Check your server settings.
                </span>
            );
        return (
            <div>Projects</div>
        );
    }
});


var SettingsProjectItem = React.createClass({
    render: function() {
        <div className="form-group">
            <input type="checkbox" id={"proj" + this.props.id} ref="cb" />
            <label className="control-label col-sm-2" htmlFor={"proj" + this.props.id}>{this.props.projectName}</label>
        </div>
    }
});

export { SettingsPage, SettingsPageTitle };