'use strict';
import React from "react";
import { SettingsPage, SettingsPageTitle } from './pages/SettingsPage';
import { MergeRequestsPage, MergeRequestsPageTitle } from './pages/MergeRequestsPage';

import NavigationBar from './components/NavigationBar';
import RefreshButton from './components/RefreshButton';
import SearchBar from './components/SearchBar';
import ErrorPanel from './components/ErrorPanel';

import LoadingPanel from './components/LoadingPanel';

var ipc = electronRequire('ipc');

var GitLabCenterApp = React.createClass({
    getInitialState: function() {
        return { 
            activePage: MergeRequestsPage.menuItem.key,
            error: "",
            isNavigationVisible: false,
            searchString: "",
            settings: {
                gitlabUrl: "",
                gitlabToken: ""
            },
            projects: [],
            users: {},
            isLoading: true
        };
    },
    componentDidMount: function() {
        ipc.on('init-request-reply', (result) => {
            this.setState(
                {
                    settings: {
                        gitlabUrl: result.gitlabUrl,
                        gitlabToken: result.gitlabToken
                    },
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users
                }
            );
        });
        ipc.on('update-settings-reply', (result) => {
            this.setState(
                {
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users
                }
            );
        });
        ipc.on('update-projects-reply', (result) => {
            this.setState(
                {
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users
                }
            );
        });
        ipc.send('init-request');
    },
    onStateChanged: function(state) {
        if(state.settings) {
            state.isLoading = true;
            state.projects = [];
            ipc.send('update-settings', {
                gitlabUrl: state.settings.gitlabUrl === undefined ? this.state.settings.gitlabUrl : state.settings.gitlabUrl,
                gitlabToken: state.settings.gitlabToken === undefined ? this.state.settings.gitlabToken : state.settings.gitlabToken
            });
        }
        if(state.projects) {
            ipc.send('update-projects', state.projects);
            state.projects = [];
            state.isLoading = true;
        }
        this.setState(state);
    },
    switchActivePage: function(key) {
        this.setState({
            activePage: key
        });
    },
    switchToSettings: function() {
        this.setState({
            activePage: "Settings"
        });
    },
    render: function() {
        // var activePage = null,
        //     pageTitle = null;
        // switch(this.state.activePage) {
        //     case SettingsPage.menuItem.key:
        //         activePage = ();
        //         PageTitle = SettingsPageTitle;
        //         break;
        //     case MergeRequestsPage.menuItem.key:
        //         ActivePage = MergeRequestsPage;
        //         PageTitle = MergeRequestsPageTitle;
        //         break;
        //     default:
        //         throw new Error("Unknown page type: " + this.state.activePage);
        // }    
            
        
        var ActivePage = null;
        var PageTitle = null;
        
        switch(this.state.activePage) {
            case SettingsPage.menuItem.key:
                ActivePage = SettingsPage;
                PageTitle = SettingsPageTitle;
                break;
            case MergeRequestsPage.menuItem.key:
                ActivePage = MergeRequestsPage;
                PageTitle = MergeRequestsPageTitle;
                break;
            default:
                throw new Error("Unknown page type: " + this.state.activePage);
        }
        
        var state = this.state;
        
        return (
            <div>
                { this.state.isLoading ? <LoadingPanel /> : null }
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-brand">
                            <PageTitle />
                        </div>
                        <div className="navbar-right">
                            <SearchBar searchString={this.state.searchString} />
                            <RefreshButton />
                        </div>
                    </div>
                </nav>
                <NavigationBar activePage={this.state.activePage} visible={this.state.isNavigationVisible} items={[MergeRequestsPage.menuItem, SettingsPage.menuItem]} onNavigate={this.switchActivePage} />
                <div className="main">
                    {this.state.error ? <ErrorPanel text={this.state.error} isSettingsButtonVisible={this.state.activePage !== "Settings"} onSettingsClick={this.switchToSettings} /> : null }
                    <div className="main-content">
                        <ActivePage {...state} onStateChanged={this.onStateChanged} />
                    </div>
                </div>
            </div>
        );
    } 
});
export default GitLabCenterApp;