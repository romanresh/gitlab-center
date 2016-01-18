require('../less/main.less');

'use strict';

import React from "react";
import ReactDOM from "react-dom";


var ProjectList = React.createClass({
  render: function() {
    return (
      <div className="project-list">
        <h1>Project List</h1>
        list
      </div>
    );
  }
});
ReactDOM.render(
  <ProjectList />
, document.getElementById("content"));