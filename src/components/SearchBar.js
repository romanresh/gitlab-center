'use strict';
import React from "react";

var SearchBar = React.createClass({
   render: function() {
       if(this.props.isVisible) { 
            return (
                    <input type="text" className="btn btn-default" placeholder="Filter by title or description" value={this.props.searchString} onChange={this.props.onSearchChange}  />
            );
       }
       return null;
   } 
});

export default SearchBar;