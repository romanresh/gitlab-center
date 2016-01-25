'use strict';
import React from "react";

var RefreshButton = React.createClass({
   render: function() {
       return (
           <button type="button" className="refresh-button btn btn-info navbar-btn" title="Sync">
                <span className="glyphicon glyphicon-refresh"></span>
           </button>
       );
   } 
});

export default RefreshButton;