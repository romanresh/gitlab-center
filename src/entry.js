require('../less/main.less');

'use strict';

import React, { PropTypes } from "react";
import ReactDOM from "react-dom";
import ProjectItem from './components/mergeRequest';

var ipc = electronRequire('ipc');

var ProjectListApp = React.createClass({
  getInitialState: function() {
    return { items: [] };
  },
  componentDidMount: function() {
      ipc.send('need-project-list');
      var _this = this;
      ipc.on('need-project-list-reply', (projects) => {
        if(projects) {
            this.setState( {items: projects} );
        }
      });
  },
  render: function() {
    return (
      <div>
        <h3>Project Items</h3>
        <ProjectList items={this.state.items} />
      </div>
    );
  }
});

var ProjectList = React.createClass({
  render: function() {
    var projectItems = this.props.items.map(function(item) {
        return <ProjectItem name={item.name} key={item.id} />;
    });
    return (
    <ul>
        {projectItems}
    </ul>);
  }
});


ReactDOM.render(
  <ProjectListApp />
, document.getElementById("content"));