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
                
            },
            isLoading: true
        };
    },
    componentDidMount: function() {
        ipc.on('init-request-reply', (state) => {
            this.setState(
                {
                    settings: {
                        gitlabUrl: state.gitlabUrl,
                        gitlabToken: state.gitlabToken
                    },
                    error: state.error,
                    isLoading: false
                }
            );
        });
        ipc.send('init-request');
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
                        <ActivePage searchString={this.state.searchString} />
                    </div>
                </div>
            </div>
        );
    } 
});
export default GitLabCenterApp;