/** @jsx React.DOM */
"use strict";

var React = require('react');
var LinksBox = require('./LinksBox.jsx');
var $ = require('jquery');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return { user: {} };
  },

  componentDidMount: function() {
    this.setUser('/api/users/' + this.props.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.setUser('/api/users/' + newProps.userId);
  },

  setUser: function(url) {
    $.ajax({
      url: url,
      success: function(user) {
        this.setState({ user: user });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="profileBox">
        <img className="profilePicture img-responsive img-thumbnail col-md-2" src={this.state.user.picture}></img>
        <div className="profileData">
          <h3 className="profileUsername">{this.state.user.username}</h3>
          <div><LinksBox links={this.state.user.links} /></div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
