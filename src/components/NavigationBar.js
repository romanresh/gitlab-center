'use strict';
import React from "react";

var NavigationBar = React.createClass({
    getDefaultProps: function() {
        return {
            items: []
        };
    },
    render: function () {
        var items = this.props.items.map(function (item) {
            return (
                <NavigationBarItem text={item.text} isActive={item.isActive} faIcon={item.faIcon} key={item.key} />
            );
        });

        return (
            <div className="sidebar-wrapper">
                <ul className="sidebar-nav nav-pills nav-stacked" id="menu">
                    {items}
                </ul>
            </div>
       );
   } 
});

var NavigationBarItem = React.createClass({
    render: function () {
        return (
            <li className={ this.props.isActive ? "active" : "" }>
                <a href="#">
                    <span className="fa-stack fa-lg pull-left" ><i className={ "fa fa-stack-1x fa-" + this.props.faIcon }></i></span>
                    { this.props.text }
                </a>
            </li>
       );
   } 
});

export default NavigationBar;