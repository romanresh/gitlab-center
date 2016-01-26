'use strict';
import React from "react";

var RefreshButton = React.createClass({
   render: function() {
       return (
           <button type="button" className="refresh-button btn btn-info navbar-btn" title="Sync" onClick={this.props.onRefreshClick}>
                <span className={"fa fa-refresh" + (this.props.isSyncing ? " fa-spin" : "")}></span>
           </button>
       );
   } 
});

export default RefreshButton;