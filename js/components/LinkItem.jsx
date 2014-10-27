/** @jsx React.DOM */
"use strict";

var React = require('react');
var PubSub = require('pubsub-js');
var $ = require('jquery');
var auth = require('../auth.jsx');

var LinkItem = React.createClass({
  getInitialState: function() {
    return { 
      showEdit: false 
    }; 
  },

  handleMouseOver: function() {
    this.setState({ showEdit: true });
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  deleteLinkItem: function() {
    var url = '/api/users/' + this.props.user._id;
    var links = []; 
    for (var i = 0; i < this.props.user.links.length; i++) {
      var link = this.props.user.links[i];
      if (link.url != this.props.link.url && link.title != this.props.link.title) {
        links.push(link);
      }
    }
    if (links.length === 0) {
      links.push("EMPTY");
    }
    this.updateUserLinks(links);
  },

  updateUserLinks: function(links) {
    var url = '/api/users/' + this.props.user._id;
    var user = this.props.user;
    user.links = links;
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        PubSub.publish('profileupdate');
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var edit = '';
    if (this.props.currentUser._id == this.props.user._id) {
      if (this.state.showEdit) {
      edit = <div className="edit">
          <a><span className="pencil glyphicon glyphicon-pencil"></span></a>
          <p className="divider"> | </p>
          <a onClick={this.deleteLinkItem}><span className="remove glyphicon glyphicon-remove"></span></a>
        </div>;
      }
    }

    return(
      <div className="linkItem" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <div className="text">
          <strong>{this.props.link.title}</strong>: <a href={this.props.link.url}>{this.props.link.url}</a>
        </div>
        {edit}
      </div> 
    );
  }
});

module.exports = LinkItem;
