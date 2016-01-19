'use strict';
import React from "react";

var ItemTag = React.createClass({
   render: function() {
       return(
        <span className="item-tag" style={backgroundColor: {this.props.color}}>
            {this.props.name}
        </span>
       );
   } 
});

export default ItemTag;