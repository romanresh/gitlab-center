'use strict';
import React from "react";

var ErrorPanel = React.createClass({
   render: function() {
       return (
        <div className="error-panel alert alert-danger" role="alert">
            <span className="message"><strong>Oh damn!</strong> {this.props.text}. </span>
            {this.props.isSettingsButtonVisible ? <ErrorPanelSettingButton onSettingsClick={this.props.onSettingsClick} /> : null}
        </div>
       );
   } 
});

var ErrorPanelSettingButton = React.createClass({
   render: function() {
       return (
           <a href="#" className="alert-link" onClick={this.props.onSettingsClick}>Go To Settings</a>
       );
   } 
});

export default ErrorPanel;