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
                gitlabToken: "",
                updateTimeout: -1
            },
            projects: [],
            users: {},
            isLoading: true,
            isSyncing: false,
            userId: -1
        };
    },
    componentDidMount: function() {
        ipc.on('init-request-reply', (result) => {
            this.setState(
                {
                    settings: {
                        gitlabUrl: result.gitlabUrl,
                        gitlabToken: result.gitlabToken,
                        updateTimeout: result.updateTimeout
                    },
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users,
                    userId: result.userId
                }
            );
        });
        ipc.on('update-settings-reply', (result) => {
            this.setState(
                {
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users,
                    userId: result.userId
                }
            );
        });
        ipc.on('update-projects-reply', (result) => {
            this.setState(
                {
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users,
                    userId: result.userId
                }
            );
        });
        ipc.on('sync-reply', result => {
            this.setState(
                {
                    isSyncing: false,
                    error: result.error,
                    isLoading: false,
                    projects: result.projects,
                    users: result.users,
                    userId: result.userId
                }
            );
        });
        ipc.on('before-sync', () => {
            this.setState({
                isSyncing: true
            });
        });
        ipc.send('init-request');
    },
    onStateChanged: function(state) {
        if(state.settings) {
            state.isLoading = true;
            state.projects = [];
            ipc.send('update-settings', {
                gitlabUrl: state.settings.gitlabUrl === undefined ? this.state.settings.gitlabUrl : state.settings.gitlabUrl,
                gitlabToken: state.settings.gitlabToken === undefined ? this.state.settings.gitlabToken : state.settings.gitlabToken,
                updateTimeout: state.settings.updateTimeout === undefined ? this.state.settings.updateTimeout : state.settings.updateTimeout,
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
    onTitleBadgeClick: function(arg) {
        this.setState({
            searchString: ""
        });
        this.refs["page"].onBadgeClick(arg);
    },
    onSearchChange:function(arg) {
        this.setState({
            searchString: arg.target.value
        });
    },
    onRefreshClick: function() {
        if(this.state.isSyncing)
            return;
        this.setState({
            isSyncing: true
        });
        ipc.send('sync');
    },
    render: function() {
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
                        <div classNamw="navbar-header">
                            <div className="navbar-brand">
                                <PageTitle {...state} onBadgeClick={this.onTitleBadgeClick} />
                            </div>
                        </div>

                        <div className="navbar-collapse pull-right">
                            <SearchBar searchString={this.state.searchString} onSearchChange={this.onSearchChange} isVisible={ActivePage.supportSearch} />
                            <RefreshButton onRefreshClick={this.onRefreshClick} isSyncing={this.state.isSyncing} />
                        </div>
                    </div>
                </nav>
                <NavigationBar activePage={this.state.activePage} visible={this.state.isNavigationVisible} items={[MergeRequestsPage.menuItem, SettingsPage.menuItem]} onNavigate={this.switchActivePage} />
                <div className="main">
                    {this.state.error ? <ErrorPanel text={this.state.error} isSettingsButtonVisible={this.state.activePage !== "Settings"} onSettingsClick={this.switchToSettings} /> : null }
                    <div className="main-content">
                        <ActivePage {...state} onStateChanged={this.onStateChanged} ref="page" />
                    </div>
                </div>
            </div>
        );
    } 
});
export default GitLabCenterApp;