'use strict';
import React from "react";

var MergeRequestsPage = React.createClass({
   render: function() {
       return (
           <span>Merge Requests Page</span>
       );
   } 
});
MergeRequestsPage.menuItem = {
    key: "MergeRequest",
    text: "Merge Requests",
    faIcon: "tasks"
};

var MergeRequestsPageTitle = React.createClass({
   render: function() {
       return (
           <span>{MergeRequestsPage.menuItem.text}</span>
       );
   } 
});

export { MergeRequestsPage, MergeRequestsPageTitle };