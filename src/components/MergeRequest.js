'use strict';
import React from "react";
import ItemTag from "./components/ItemTag";

var MergeRequest = React.createClass({
    getDateDiffString: function(date) {
        return date.toString(); // todo: implement it
    },
    render: function() {
        return (
        <div>
            <h3>{this.props.name}</h3>
            <div className="tags">
                <ItemTag text={this.props.status} />
            </div>
            <div className="description">
                Opened {this.getDateDiffString(this.props.date)} by {this.props.authorName}
                <br/>
                Assigned to {this.props.assigneeName}
            </div>
            <div className="project-info">
                <span className="sourceProject">{this.props.sourceProjectName}</span> 
                <span className="sourceBranch">({this.props})</span> 
                ->
                <span className="targetProject">{this.props.targetProjectName}</span>
                <span className="targetBranch">({this.props.targetBranchName})</span>
            </div>
        </div>
        );
    } 
});
export default MergeRequest;

// todo: remove it
var ProjectItem = React.createClass({
   render: function() {
       return(
        <li className="project-item">
            <h3>{this.props.name}</h3>
        </li>
       );
   } 
});

export default ProjectItem;