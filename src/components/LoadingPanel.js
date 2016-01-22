'use strict';
import React from "react";

var LoadingPanel = React.createClass({
   render: function() {
       return(
           <div className="loading-panel">
            <div className="loading"><i className="fa fa-cog fa-spin"></i> Loading</div>
           </div>
       );
   } 
});

export default LoadingPanel;