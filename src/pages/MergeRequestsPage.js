'use strict';
import React from "react";

var MergeRequestsPage = React.createClass({
   render: function() {
       return (
           <span>Merge Requests Page</span>
       );
   } 
});

var MergeRequestsPageTitle = React.createClass({
   render: function() {
       return (
           <h1>Merge Requests</h1>
       );
   } 
});

export { MergeRequestsPage, MergeRequestsPageTitle };