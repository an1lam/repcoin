/** @jsx React.DOM */
"use strict";

var React = require('react');
var Feed = require('./Feed.jsx');
var $ = require('jquery');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return { user: {} };
  },

  componentDidMount: function() {
    $.ajax({
      url: '/api/users/' + this.props.userId,
      success: function(user) {
        this.setState({ user: user });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var safeLinks = this.state.user.links ? this.state.user.links : [];
    var links = safeLinks.map(function(link) {
      return <div><strong>{link.title}</strong>: <a href={link.url}>{link.url}</a></div>;
    });
    return (
      <div className="profileBox">
        <img className="profilePicture img-responsive img-thumbnail" src={this.state.user.picture}></img>
        <div className="profileData">
          <h3 className="profileUsername">{this.state.user.username}</h3>
          {links}
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
