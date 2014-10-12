/** @jsx React.DOM */
"use strict";

var React = require('react');
var Feed = require('./Feed.jsx');
var $ = require('jquery');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return { currentUser: {} };
  },

  componentDidMount: function() {
    $.ajax({
      url: '/api/users/' + this.props.user,
      success: function(user) {
        this.setState({ currentUser: user });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.user, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var safeLinks = this.state.currentUser.links ? this.state.currentUser.links : [];
    var links = safeLinks.map(function(link) {
      return <div><strong>{link.title}</strong>: <a href={link.url}>{link.url}</a></div>;
    });
    return (
      <div className="profileBox">
        <img className="profilePicture img-responsive img-thumbnail" src={this.state.currentUser.picture}></img>
        <div className="profileData">
          <h3 className="profileUsername">{this.state.currentUser.username}</h3>
          {links}
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
