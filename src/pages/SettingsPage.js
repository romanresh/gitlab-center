'use strict';
import React from "react";

var SettingsPage = React.createClass({
   render: function() {
       return (
           <span>Settings Page</span>
       );
   } 
});

var SettingsPageTitle = React.createClass({
   render: function() {
       return (
           <h1>Settings</h1>
       );
   } 
});

export { SettingsPage, SettingsPageTitle };