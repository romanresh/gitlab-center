'use strict';
import React from "react";

var SearchBar = React.createClass({
   render: function() {
       return(
           <form className="navbar-form navbar-left" role="search">
            <input type="text" className="btn btn-default" placeholder="Search" />
           </form>
       );
   } 
});

export default SearchBar;