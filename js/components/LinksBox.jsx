/** @jsx React.DOM */
"use strict";

var React = require('react');
var LinkItem = require('./LinkItem.jsx');
var LinkInput = require('./LinkInput.jsx');
var $ = require('jquery');

var LinksBox = React.createClass({
  getInitialState: function() {
    return { showEdit: false, showInput : false };
  },

  handleMouseChange: function() {
    this.setState({ showEdit: !this.state.showEdit });
  },

  handleClick: function() {
    this.setState({ showInput: true });
  },

  render: function() {
    var edit = '';
    if (this.state.showEdit) {
      edit = <div className="editBox" onClick={this.handleClick}>
               <button className="btn btn-default btn-small">
                 <span className="glyphicon glyphicon-plus"></span>
               </button>
              </div>;
    }

    var linkInput = '';  
    if (this.state.showInput) {
      linkInput = <LinkInput />;
    }

    var safeLinks = this.props.links ? this.props.links : [];
    var links = safeLinks.map(function(link) {
      return <li className="list-group-item"><LinkItem link={link} /></li>;
    });
    return(
      <div className="linksBox col-md-4" onMouseEnter={this.handleMouseChange} onMouseLeave={this.handleMouseChange}>
        <h4>Links</h4>
        {edit}
        {linkInput}
        <ul className="list-group">
          {links} 
        </ul>
      </div>
    );
  }
});

module.exports = LinksBox;  
