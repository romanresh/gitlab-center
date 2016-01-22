'use strict';
import React from "react";

var NavigationBar = React.createClass({
    getDefaultProps: function() {
        return {
            items: []
        };
    },
    onNavigate: function(key) {
        this.props.onNavigate(key);
    },
    render: function () {
        var items = this.props.items.map((item) => {
            return (
                <NavigationBarItem text={item.text} isActive={this.props.activePage === item.key} faIcon={item.faIcon} key={item.key} pageKey={item.key} onNavigate={this.onNavigate} />
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
    navigate: function() {
        if(!this.props.isActive)
            this.props.onNavigate(this.props.pageKey);
    },
    render: function () {
        return (
            <li className={ this.props.isActive ? "active" : "" }>
                <a href="#" onClick={this.navigate}>
                    <span className="fa-stack fa-lg pull-left"><i className={ "fa fa-stack-1x fa-" + this.props.faIcon }></i></span>
                    { this.props.text }
                </a>
            </li>
       );
   } 
});

export default NavigationBar;