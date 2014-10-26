/** @jsx React.DOM */
"use strict";

var React = require('react');
var LinkItem = require('./LinkItem.jsx');
var LinkInput = require('./LinkInput.jsx');
var auth = require('../auth.jsx');
var $ = require('jquery');

var LinksBox = React.createClass({
  getInitialState: function() {
    return { showEdit: false, showInput : false, user: null };
  },
  
  handleMouseOver: function() {
    if (!this.state.showInput) {
      this.setState({ showEdit: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false }); 
  },

  handleClick: function() {
    this.setState({ showInput: true });
  },

  closeInputBox: function() {
    this.setState({ showInput: false });
  },

  makeLinkItem: function(link) {
    return <li className="list-group-item"><LinkItem link={link} currentUser={this.props.currentUser} user={this.props.user}/></li>;
  },

  render: function() {
    var edit = '';
    var linkInput = '';
    if (this.props.currentUser._id == this.props.user._id) {
      if (this.state.showEdit) {
        edit = <div className="editBox" onClick={this.handleClick}>
                 <button className="btn btn-default btn-small">
                   <span className="glyphicon glyphicon-plus"></span>
                 </button>
               </div>;
      }

      if (this.state.showInput) {
        linkInput = <LinkInput currentUser={this.props.currentUser} user={this.props.user} onReset={this.closeInputBox}/>;
      }
    }

    var safeLinks = this.props.links ? this.props.links : [];
    var links = '';
    if (this.props.currentUser) {
      links = safeLinks.map(this.makeLinkItem);
    }

   return(
      <div className="linksBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
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
