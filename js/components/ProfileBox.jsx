/** @jsx React.DOM */
"use strict";

var React = require('react');

var ProfileBox = React.createClass({
  render: function() {
    return (
      <div className="profileBox">
        {this.props.user.name}<br />
        <img className="profilePicture" src={this.props.user.picture}></img>
        <div className="profileData">
          Username: {this.props.user.username}<br />
          Github: {this.props.user.github}<br />
          Website: {this.props.user.website}<br />
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
