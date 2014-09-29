/** @jsx React.DOM */
"use strict";

var React = require('react');
var Feed = require('./Feed');

var ProfileBox = React.createClass({
  render: function() {
    return (
      <div className="profileBox">
        <img className="profilePicture img-responsive img-thumbnail" src={this.props.user.picture}></img>
        <div className="profileData">
          <h3 className="profileUsername">{this.props.user.name}</h3>
          <div className="username"><h4>Username: {this.props.user.username}</h4></div>
          <div className="github"><h4>Github: {this.props.user.github}</h4></div>
          <div className="website"><h4>Website: {this.props.user.website}</h4></div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
