'use strict';
import React from "react";

var SettingsPage = React.createClass({
   render: function() {
       return (
           <form className="form-horizontal" role="form">
                <div className="form-group">
                    <label className="control-label col-sm-2" for="email">GitLab URL:</label>
                    <div className="col-sm-10">
                        <input type="email" className="form-control" id="email" placeholder="http://" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label col-sm-2" for="pwd">Profile token:</label>
                    <div className="col-sm-10"> 
                        <input type="text" className="form-control" id="pwd" placeholder="Copy from Profile Settings -> Account" />
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

export { SettingsPage, SettingsPageTitle };