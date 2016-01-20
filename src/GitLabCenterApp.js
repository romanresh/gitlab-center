'use strict';
import React from "react";
import { SettingsPage, SettingsPageTitle } from './pages/SettingsPage';
import { MergeRequestsPage, MergeRequestsPageTitle } from './pages/MergeRequestsPage';

import NavigationBar from './components/NavigationBar';
import HeaderButton from './components/HeaderButton';
import SearchBar from './components/SearchBar';

var GitLabCenterApp = React.createClass({
    getInitialState: function() {
        return { 
            activePage: "Settings",
            isNavigationVisible: false,
            searchString: ""
        };
    },
    render: function() {
        var ActivePage = null;
        var PageTitle = null;
        
        switch(this.state.activePage) {
            case "Settings":
                ActivePage = SettingsPage;
                PageTitle = SettingsPageTitle;
                break;
            case "MergeRequest":
                ActivePage = MergeRequestsPage;
                PageTitle = MergeRequestsPageTitle;
                break;
            default:
                throw new Error("Unknown page type: " + this.state.activePage);
        }
        
        return (
            <div>
                <span>qwe</span>
                <NavigationBar activePage={this.state.activePage} visible={this.state.isNavigationVisible}/>
                <div className="header">
                    <div className="left-area">
                        <HeaderButton active={this.state.isNavigationVisible} />
                        <PageTitle />
                    </div>
                    <div className="right-area">
                        <SearchBar searchString={this.state.searchString} />
                        <HeaderButton active={this.state.activePage === "Settings"} />
                    </div>
                </div>
                <div className="main-content">
                    <ActivePage searchString={this.state.searchString} />
                </div>
            </div>
        );
    } 
});
export default GitLabCenterApp;