'use strict';
import React from "react";

var SearchBar = React.createClass({
   render: function() {
       return(
            <input type="text" className="btn btn-default" placeholder="Search" value={this.props.searchString} onChange={this.props.onSearchChange} />
       );
   } 
});

export default SearchBar;